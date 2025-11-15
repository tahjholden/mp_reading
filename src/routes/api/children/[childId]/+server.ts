import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createClient } from '$lib/supabase/server';
import { getSessionUser, requireAuth } from '$lib/middleware/session';
import { formatError, AuthorizationError, NotFoundError, AuthenticationError } from '$lib/utils/errors';

export const GET: RequestHandler = async (event) => {
	try {
		const user = await requireAuth(event);
		const { childId } = event.params;

		const supabase = createClient(event);

		// Get child profile
		const { data: childData, error: childError } = await supabase
			.from('children')
			.select('*')
			.eq('id', childId)
			.single();

		if (childError || !childData) {
			throw new NotFoundError('Child not found');
		}

		// Verify access permissions
		if (user.type === 'child') {
			// Child can only access their own profile
			if (user.id !== childId) {
				throw new AuthorizationError('Access denied');
			}
		} else if (user.type === 'parent') {
			// Parent can access their own children
			if (childData.primary_parent_id !== user.id) {
				// Check if parent has access via invitation
				const { data: invitation } = await supabase
					.from('parent_invitations')
					.select('*')
					.eq('child_id', childId)
					.eq('invited_email', user.email)
					.eq('status', 'accepted')
					.single();

				if (!invitation) {
					throw new AuthorizationError('Access denied');
				}
			}
		}

		// Log data access (for COPPA compliance)
		// This would be logged to data_access_logs in production

		// Remove password_hash from response
		const { password_hash, ...childWithoutPassword } = childData;

		return json(childWithoutPassword);
	} catch (error) {
		const formattedError = formatError(error);
		const statusCode =
			error instanceof AuthenticationError
				? 401
				: error instanceof AuthorizationError
					? 403
					: error instanceof NotFoundError
						? 404
						: 500;

		return json(formattedError, { status: statusCode });
	}
};

