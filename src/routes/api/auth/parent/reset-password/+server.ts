import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createClient } from '$lib/supabase/server';
import { sendPasswordResetEmail } from '$lib/server/api/auth/send-reset-email';
import { formatError, ValidationError } from '$lib/utils/errors';

export const POST: RequestHandler = async (event) => {
	try {
		const { email } = await event.request.json();

		// Validate input
		if (!email) {
			throw new ValidationError('Email is required');
		}

		// Validate email format
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) {
			throw new ValidationError('Invalid email format');
		}

		const supabase = createClient(event);

		// Check if parent exists (for security, don't reveal if email exists)
		// We'll send reset email regardless to prevent email enumeration
		const { error } = await sendPasswordResetEmail(supabase, email);

		if (error) {
			// Log error but don't reveal if email exists (security)
			console.error('Password reset error:', error);
			// Still return success to prevent email enumeration
		}

		// Always return success to prevent email enumeration attacks
		return json({ success: true, message: 'If an account exists, a password reset email has been sent' });
	} catch (error) {
		const formattedError = formatError(error);
		const statusCode = error instanceof ValidationError ? 400 : 500;

		return json(formattedError, { status: statusCode });
	}
};

