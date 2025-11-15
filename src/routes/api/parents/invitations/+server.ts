import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createClient } from '$lib/supabase/server';
import { requireAuth } from '$lib/middleware/session';
import { generateInvitationToken } from '$lib/server/api/invitations/generate-token';
import { sendInvitationEmail } from '$lib/server/api/invitations/send-email';
import { formatError, AuthorizationError, ValidationError, NotFoundError } from '$lib/utils/errors';

export const POST: RequestHandler = async (event) => {
	try {
		const user = await requireAuth(event);

		// Only parents can send invitations
		if (user.type !== 'parent') {
			throw new AuthorizationError('Only parents can send invitations');
		}

		const { child_id, invited_email } = await event.request.json();

		// Validate input
		if (!child_id) {
			throw new ValidationError('child_id is required');
		}

		if (!invited_email) {
			throw new ValidationError('invited_email is required');
		}

		// Validate email format
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(invited_email)) {
			throw new ValidationError('Invalid email format');
		}

		const supabase = createClient(event);

		// Verify child exists and user is primary parent
		const { data: childData, error: childError } = await supabase
			.from('children')
			.select('*')
			.eq('id', child_id)
			.single();

		if (childError || !childData) {
			throw new NotFoundError('Child not found');
		}

		// Only primary parent can send invitations
		if (childData.primary_parent_id !== user.id) {
			throw new AuthorizationError('Only primary parent can send invitations');
		}

		// Check if invitation already exists (pending)
		const { data: existingInvitation } = await supabase
			.from('parent_invitations')
			.select('*')
			.eq('child_id', child_id)
			.eq('invited_email', invited_email)
			.eq('status', 'pending')
			.gt('expires_at', new Date().toISOString())
			.single();

		if (existingInvitation) {
			throw new ValidationError('Invitation already sent to this email');
		}

		// Generate secure token
		const token = generateInvitationToken();

		// Set expiration (7 days from now)
		const expiresAt = new Date();
		expiresAt.setDate(expiresAt.getDate() + 7);

		// Create invitation
		const { data: invitationData, error: invitationError } = await supabase
			.from('parent_invitations')
			.insert({
				child_id,
				invited_email,
				invited_by_parent_id: user.id,
				token,
				status: 'pending',
				expires_at: expiresAt.toISOString()
			})
			.select()
			.single();

		if (invitationError || !invitationData) {
			return json({ error: 'Failed to create invitation' }, { status: 500 });
		}

		// Get parent name for email
		const { data: parentData } = await supabase
			.from('parents')
			.select('email')
			.eq('id', user.id)
			.single();

		// Send invitation email
		await sendInvitationEmail(
			invited_email,
			token,
			childData.name,
			parentData?.email || undefined
		);

		// Return invitation data (excluding token for security)
		const { token: _, ...invitationWithoutToken } = invitationData;

		return json(
			{
				...invitationWithoutToken,
				token // Include token in response for testing, remove in production
			},
			{ status: 201 }
		);
	} catch (error) {
		const formattedError = formatError(error);
		const statusCode =
			error instanceof AuthorizationError
				? 403
				: error instanceof ValidationError
					? 400
					: error instanceof NotFoundError
						? 404
						: 500;

		return json(formattedError, { status: statusCode });
	}
};

