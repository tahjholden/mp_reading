import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createClient } from '$lib/supabase/server';
import { requireAuth } from '$lib/middleware/session';
import { listBooks } from '$lib/server/api/books/list';
import { formatError, AuthenticationError } from '$lib/utils/errors';

/**
 * List books with filtering and pagination
 * GET /api/books?genre=Adventure&reading_level_min=500&page=1&limit=20
 */
export const GET: RequestHandler = async (event) => {
	try {
		// Require authentication (books are readable by all authenticated users)
		await requireAuth(event);

		const supabase = createClient(event);
		const url = new URL(event.request.url);

		// Parse query parameters
		const params = {
			genre: url.searchParams.getAll('genre'),
			reading_level_min: url.searchParams.get('reading_level_min')
				? parseInt(url.searchParams.get('reading_level_min')!)
				: undefined,
			reading_level_max: url.searchParams.get('reading_level_max')
				? parseInt(url.searchParams.get('reading_level_max')!)
				: undefined,
			grade_level: url.searchParams.get('grade_level')
				? parseInt(url.searchParams.get('grade_level')!)
				: undefined,
			search: url.searchParams.get('search') || undefined,
			page: url.searchParams.get('page') ? parseInt(url.searchParams.get('page')!) : 1,
			limit: url.searchParams.get('limit') ? parseInt(url.searchParams.get('limit')!) : 20
		};

		// Remove empty genre array
		if (params.genre.length === 0) {
			delete params.genre;
		}

		const result = await listBooks(supabase, params);

		return json(result);
	} catch (err) {
		const formattedError = formatError(err);
		const statusCode = err instanceof AuthenticationError ? 401 : 500;
		return json(formattedError, { status: statusCode });
	}
};



