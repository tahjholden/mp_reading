import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createClient } from '$lib/supabase/server';
import { requireAuth } from '$lib/middleware/session';
import { updateChildAvatar } from '$lib/server/api/children/update-avatar';
import { formatError, AuthorizationError, NotFoundError, AuthenticationError } from '$lib/utils/errors';

export const PUT: RequestHandler = async (event) => {
	try {
		const user = await requireAuth(event);
		const { childId } = event.params;
		const { avatar_data } = await event.request.json();

		if (!avatar_data) {
			return json({ error: 'avatar_data is required' }, { status: 400 });
		}

		const supabase = createClient(event);

		// Verify child exists and user has access
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
			// Child can only update their own avatar
			if (user.id !== childId) {
				throw new AuthorizationError('Access denied');
			}
		} else if (user.type === 'parent') {
			// Only primary parent can update child avatar
			if (childData.primary_parent_id !== user.id) {
				throw new AuthorizationError('Only primary parent can update avatar');
			}
		}

		// Update avatar
		const { data: updatedChild, error: updateError } = await updateChildAvatar(
			supabase,
			childId,
			avatar_data
		);

		if (updateError) {
			return json({ error: 'Failed to update avatar' }, { status: 500 });
		}

		// Remove password_hash from response
		const { password_hash, ...childWithoutPassword } = updatedChild!;

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

