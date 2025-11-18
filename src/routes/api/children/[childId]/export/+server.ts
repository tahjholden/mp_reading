import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { exportChildData } from '$lib/server/api/children/export-data';
import { requireAuth } from '$lib/middleware/session';
import { createClient } from '$lib/supabase/server';
import { formatError, AuthorizationError, NotFoundError, AuthenticationError } from '$lib/utils/errors';

/**
 * Export child data for COPPA compliance
 * GET /api/children/[childId]/export
 */
export const GET: RequestHandler = async (event) => {
	try {
		const user = await requireAuth(event);
		if (user.type !== 'parent') {
			return json({ error: 'Only parents can export child data' }, { status: 403 });
		}

		const { childId } = event.params;
		if (!childId) {
			return json({ error: 'Child ID is required' }, { status: 400 });
		}

		const supabase = createClient(event);

		// Verify parent has access to this child
		const { data: child, error: childError } = await supabase
			.from('children')
			.select('*')
			.eq('id', childId)
			.eq('primary_parent_id', user.id)
			.single();

		if (childError || !child) {
			throw new NotFoundError('Child not found or access denied');
		}

		const exportData = await exportChildData(supabase, childId, user.id);

		// Return as JSON with appropriate headers for download
		return json(exportData, {
			headers: {
				'Content-Type': 'application/json',
				'Content-Disposition': `attachment; filename="child-data-export-${childId}-${Date.now()}.json"`
			}
		});
	} catch (err) {
		const formattedError = formatError(err);
		const statusCode =
			err instanceof AuthenticationError
				? 401
				: err instanceof AuthorizationError
					? 403
					: err instanceof NotFoundError
						? 404
						: 500;
		return json(formattedError, { status: statusCode });
	}
};

