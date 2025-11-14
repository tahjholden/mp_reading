import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createClient } from '$lib/supabase/server';
import { validateUsername } from '$lib/utils/validation';
import { verifyPassword } from '$lib/utils/password';
import { AuthenticationError, ValidationError, formatError } from '$lib/utils/errors';
import jwt from 'jsonwebtoken';

export const POST: RequestHandler = async (event) => {
	try {
		const { username, password } = await event.request.json();

		// Validate input
		const usernameValidation = validateUsername(username);
		if (!usernameValidation.valid) {
			throw new ValidationError(usernameValidation.error || 'Invalid username');
		}

		if (!password) {
			throw new ValidationError('Password is required');
		}

		// Create Supabase client
		const supabase = createClient(event);

		// Find child by username
		const { data: childData, error: childError } = await supabase
			.from('children')
			.select('*')
			.eq('username', username)
			.single();

		if (childError || !childData) {
			throw new AuthenticationError('Invalid username or password');
		}

		// Verify password
		const isValidPassword = await verifyPassword(password, childData.password_hash);
		if (!isValidPassword) {
			throw new AuthenticationError('Invalid username or password');
		}

		// Create session token for child
		// Using JWT for child sessions (since they don't use Supabase Auth)
		const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-in-production';
		const sessionToken = jwt.sign(
			{
				childId: childData.id,
				username: childData.username,
				type: 'child'
			},
			JWT_SECRET,
			{ expiresIn: '7d' }
		);

		// Log authentication event (for COPPA compliance)
		// This would be logged to data_access_logs in production

		// Return child data (excluding password hash)
		const { password_hash, ...childWithoutPassword } = childData;

		return json({
			session: {
				token: sessionToken,
				expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
			},
			child: childWithoutPassword
		});
	} catch (error) {
		const formattedError = formatError(error);
		const statusCode = error instanceof AuthenticationError ? 401 : error instanceof ValidationError ? 400 : 500;

		return json(formattedError, { status: statusCode });
	}
};

