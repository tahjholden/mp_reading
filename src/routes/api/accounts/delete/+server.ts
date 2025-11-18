import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { requireAuth } from '$lib/middleware/session';
import { createClient } from '$lib/supabase/server';
import { deleteParentAccount, deleteChildAccount } from '$lib/server/api/accounts/delete';
import { formatError, AuthenticationError, AuthorizationError } from '$lib/utils/errors';

/**
 * Delete account endpoint
 * DELETE /api/accounts/delete
 * Body: { type: 'parent' | 'child', childId?: string, options?: { anonymizeChildren?: boolean, deleteChildren?: boolean } }
 */
export const DELETE: RequestHandler = async (event) => {
	try {
		const user = await requireAuth(event);
		const { type, childId, options } = await event.request.json();

		if (!type || (type !== 'parent' && type !== 'child')) {
			return json({ error: 'Invalid account type' }, { status: 400 });
		}

		const supabase = createClient(event);

		if (type === 'parent') {
			if (user.type !== 'parent') {
				return json({ error: 'Only parents can delete parent accounts' }, { status: 403 });
			}

			const result = await deleteParentAccount(supabase, user.id, options || {});

			if (!result.success) {
				return json({ error: result.error || 'Failed to delete account' }, { status: 500 });
			}

			return json({ message: 'Account deleted successfully' });
		} else {
			// Deleting child account
			if (user.type !== 'parent') {
				return json({ error: 'Only parents can delete child accounts' }, { status: 403 });
			}

			if (!childId) {
				return json({ error: 'Child ID is required' }, { status: 400 });
			}

			const result = await deleteChildAccount(supabase, childId, user.id);

			if (!result.success) {
				return json({ error: result.error || 'Failed to delete child account' }, { status: 500 });
			}

			return json({ message: 'Child account deleted successfully' });
		}
	} catch (err) {
		const formattedError = formatError(err);
		const statusCode =
			err instanceof AuthenticationError
				? 401
				: err instanceof AuthorizationError
					? 403
					: 500;
		return json(formattedError, { status: statusCode });
	}
};



