import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createClient } from '$lib/supabase/server';
import { validateEmail, validatePassword } from '$lib/utils/validation';
import { ValidationError, formatError } from '$lib/utils/errors';
import { createParentProfile } from '$lib/server/api/parents/create';

export const POST: RequestHandler = async (event) => {
	try {
		const { email, password } = await event.request.json();

		// Validate input
		const emailValidation = validateEmail(email);
		if (!emailValidation.valid) {
			throw new ValidationError(emailValidation.error || 'Invalid email');
		}

		const passwordValidation = validatePassword(password);
		if (!passwordValidation.valid) {
			throw new ValidationError(passwordValidation.error || 'Invalid password');
		}

		// Create Supabase client
		const supabase = createClient(event);

		// Sign up with Supabase Auth
		const { data: authData, error: authError } = await supabase.auth.signUp({
			email,
			password,
			options: {
				data: {
					user_type: 'parent'
				}
			}
		});

		if (authError) {
			// Check if email already exists
			if (authError.message.includes('already registered')) {
				return json({ error: 'Email already registered' }, { status: 409 });
			}
			return json({ error: authError.message }, { status: 400 });
		}

		if (!authData.user) {
			return json({ error: 'Failed to create account' }, { status: 500 });
		}

		// Create parent profile in database
		const { data: parentData, error: parentError } = await createParentProfile(supabase, {
			id: authData.user.id,
			email: authData.user.email || email
		});

		if (parentError) {
			// If parent profile creation fails, we should clean up the auth user
			// For now, just return error
			return json({ error: 'Failed to create parent profile' }, { status: 500 });
		}

		// Log signup event (for COPPA compliance)
		// This would be logged to data_access_logs in production

		return json(
			{
				parent: parentData,
				session: authData.session
			},
			{ status: 201 }
		);
	} catch (error) {
		const formattedError = formatError(error);
		const statusCode = error instanceof ValidationError ? 400 : 500;

		return json(formattedError, { status: statusCode });
	}
};

