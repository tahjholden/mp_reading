import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createClient } from '$lib/supabase/server';
import { formatError, ValidationError } from '$lib/utils/errors';

export const POST: RequestHandler = async (event) => {
	try {
		const { token, new_password } = await event.request.json();

		// Validate input
		if (!token) {
			throw new ValidationError('Token is required');
		}

		if (!new_password) {
			throw new ValidationError('New password is required');
		}

		// Validate password strength
		if (new_password.length < 8) {
			throw new ValidationError('Password must be at least 8 characters');
		}

		const supabase = createClient(event);

		// Supabase Auth handles password reset via session
		// The token is embedded in the reset link, and Supabase sets a session
		// We need to verify the session and update the password
		
		// Get current session (should be set by Supabase after clicking reset link)
		const {
			data: { session }
		} = await supabase.auth.getSession();

		if (!session) {
			// If no session, the user needs to click the reset link first
			// The token is in the URL hash, which Supabase handles
			throw new ValidationError('Invalid or expired reset token. Please request a new password reset.');
		}

		// Update password using Supabase Auth
		const { error: updateError } = await supabase.auth.updateUser({
			password: new_password
		});

		if (updateError) {
			throw new ValidationError(updateError.message || 'Failed to reset password');
		}

		// Sign out to force re-login with new password
		await supabase.auth.signOut();

		return json({ success: true, message: 'Password reset successfully. Please log in with your new password.' });
	} catch (error) {
		const formattedError = formatError(error);
		const statusCode = error instanceof ValidationError ? 400 : 500;

		return json(formattedError, { status: statusCode });
	}
};

