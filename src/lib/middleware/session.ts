/**
 * Session management middleware
 * Handles authentication for both parent (Supabase Auth) and child (JWT) sessions
 */

import type { RequestEvent } from '@sveltejs/kit';
import { createClient } from '$lib/supabase/server';
import jwt from 'jsonwebtoken';
import { AuthenticationError } from '$lib/utils/errors';

export interface SessionUser {
	id: string;
	type: 'parent' | 'child';
	email?: string;
	username?: string;
}

/**
 * Get authenticated user from request
 * Supports both parent (Supabase Auth) and child (JWT) sessions
 */
export async function getSessionUser(event: RequestEvent): Promise<SessionUser | null> {
	// Try Supabase Auth first (for parent accounts)
	const supabase = createClient(event);
	const {
		data: { session }
	} = await supabase.auth.getSession();

	if (session?.user) {
		return {
			id: session.user.id,
			type: 'parent',
			email: session.user.email
		};
	}

	// Try JWT token (for child accounts)
	const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-in-production';
	const authHeader = event.request.headers.get('authorization');
	if (authHeader?.startsWith('Bearer ')) {
		const token = authHeader.substring(7);
		try {
			const decoded = jwt.verify(token, JWT_SECRET) as {
				childId: string;
				username: string;
				type: string;
			};

			if (decoded.type === 'child') {
				return {
					id: decoded.childId,
					type: 'child',
					username: decoded.username
				};
			}
		} catch (error) {
			// Invalid token, continue to return null
		}
	}

	// Try cookie-based child session
	const childToken = event.cookies.get('child_session');
	if (childToken) {
		try {
			const decoded = jwt.verify(childToken, JWT_SECRET) as {
				childId: string;
				username: string;
				type: string;
			};

			if (decoded.type === 'child') {
				return {
					id: decoded.childId,
					type: 'child',
					username: decoded.username
				};
			}
		} catch (error) {
			// Invalid token, continue to return null
		}
	}

	return null;
}

/**
 * Require authentication - throws if user is not authenticated
 */
export async function requireAuth(event: RequestEvent): Promise<SessionUser> {
	const user = await getSessionUser(event);
	if (!user) {
		throw new AuthenticationError('Authentication required');
	}
	return user;
}

