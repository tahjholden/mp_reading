import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createClient } from '$lib/supabase/server';
import { validateEmail } from '$lib/utils/validation';
import { AuthenticationError, ValidationError, formatError } from '$lib/utils/errors';

export const POST: RequestHandler = async (event) => {
	try {
		const { email, password } = await event.request.json();

		// Validate input
		const emailValidation = validateEmail(email);
		if (!emailValidation.valid) {
			throw new ValidationError(emailValidation.error || 'Invalid email');
		}

		if (!password) {
			throw new ValidationError('Password is required');
		}

		// Create Supabase client
		const supabase = createClient(event);

		// Authenticate with Supabase Auth
		const { data, error } = await supabase.auth.signInWithPassword({
			email,
			password
		});

		if (error) {
			throw new AuthenticationError(error.message);
		}

		if (!data.user || !data.session) {
			throw new AuthenticationError('Authentication failed');
		}

		// Get parent profile
		const { data: parentData, error: parentError } = await supabase
			.from('parents')
			.select('*')
			.eq('id', data.user.id)
			.single();

		if (parentError || !parentData) {
			// Parent profile doesn't exist yet - this is okay for new signups
			// But for login, we expect it to exist
			throw new AuthenticationError('Parent profile not found');
		}

		// Log authentication event (for COPPA compliance)
		// This would be logged to data_access_logs in production

		return json({
			session: data.session,
			parent: parentData
		});
	} catch (error) {
		const formattedError = formatError(error);
		const statusCode = error instanceof AuthenticationError ? 401 : error instanceof ValidationError ? 400 : 500;

		return json(formattedError, { status: statusCode });
	}
};

