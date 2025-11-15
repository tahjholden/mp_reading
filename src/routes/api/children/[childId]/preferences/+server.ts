import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createClient } from '$lib/supabase/server';
import { requireAuth } from '$lib/middleware/session';
import { updateChildPreferences } from '$lib/server/api/children/update-preferences';
import { formatError, AuthorizationError, NotFoundError, AuthenticationError } from '$lib/utils/errors';

export const PUT: RequestHandler = async (event) => {
	try {
		const user = await requireAuth(event);
		const { childId } = event.params;
		const { reading_preferences } = await event.request.json();

		if (!reading_preferences) {
			return json({ error: 'reading_preferences is required' }, { status: 400 });
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
			// Child can only update their own preferences
			if (user.id !== childId) {
				throw new AuthorizationError('Access denied');
			}
		} else if (user.type === 'parent') {
			// Only primary parent can update child preferences
			if (childData.primary_parent_id !== user.id) {
				throw new AuthorizationError('Only primary parent can update preferences');
			}
		}

		// Update preferences
		const { data: updatedChild, error: updateError } = await updateChildPreferences(
			supabase,
			childId,
			reading_preferences
		);

		if (updateError) {
			return json({ error: 'Failed to update preferences' }, { status: 500 });
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

