import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createClient } from '$lib/supabase/server';
import { getSessionUser } from '$lib/middleware/session';
import { createParentProfile } from '$lib/server/api/parents/create';
import { formatError, ValidationError, NotFoundError } from '$lib/utils/errors';

export const POST: RequestHandler = async (event) => {
	try {
		const { token } = event.params;
		const { email, password } = await event.request.json();

		if (!token) {
			throw new ValidationError('Token is required');
		}

		const supabase = createClient(event);

		// Find invitation by token
		const { data: invitation, error: invitationError } = await supabase
			.from('parent_invitations')
			.select('*')
			.eq('token', token)
			.single();

		if (invitationError || !invitation) {
			throw new NotFoundError('Invitation not found or invalid');
		}

		// Check if invitation is expired
		if (new Date(invitation.expires_at) < new Date()) {
			// Update status to expired
			await supabase
				.from('parent_invitations')
				.update({ status: 'expired' })
				.eq('id', invitation.id);

			throw new ValidationError('Invitation has expired');
		}

		// Check if already accepted
		if (invitation.status === 'accepted') {
			throw new ValidationError('Invitation has already been accepted');
		}

		// Get current user (if logged in)
		const currentUser = await getSessionUser(event);

		let acceptingParentId: string;

		if (currentUser && currentUser.type === 'parent' && currentUser.email === invitation.invited_email) {
			// Parent is already logged in and email matches
			acceptingParentId = currentUser.id;
		} else if (email && password) {
			// Parent needs to create account or sign in
			// Check if account exists
			const { data: existingUser } = await supabase.auth.signInWithPassword({
				email,
				password
			});

			if (existingUser.user) {
				// Account exists, signed in successfully
				acceptingParentId = existingUser.user.id;

				// Verify email matches invitation
				if (existingUser.user.email !== invitation.invited_email) {
					throw new ValidationError('Email does not match invitation');
				}
			} else {
				// Create new account
				const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
					email,
					password,
					options: {
						data: {
							user_type: 'parent'
						}
					}
				});

				if (signUpError || !signUpData.user) {
					throw new ValidationError('Failed to create account');
				}

				acceptingParentId = signUpData.user.id;

				// Create parent profile
				await createParentProfile(supabase, {
					id: acceptingParentId,
					email
				});
			}
		} else {
			throw new ValidationError('Email and password required to accept invitation');
		}

		// Verify email matches invitation
		const { data: parentData } = await supabase
			.from('parents')
			.select('email')
			.eq('id', acceptingParentId)
			.single();

		if (!parentData || parentData.email !== invitation.invited_email) {
			throw new ValidationError('Email does not match invitation');
		}

		// Update invitation status
		const { error: updateError } = await supabase
			.from('parent_invitations')
			.update({
				status: 'accepted',
				accepted_at: new Date().toISOString(),
				accepted_by_parent_id: acceptingParentId
			})
			.eq('id', invitation.id);

		if (updateError) {
			return json({ error: 'Failed to accept invitation' }, { status: 500 });
		}

		return json({ success: true });
	} catch (error) {
		const formattedError = formatError(error);
		const statusCode =
			error instanceof ValidationError ? 400 : error instanceof NotFoundError ? 404 : 500;

		return json(formattedError, { status: statusCode });
	}
};

