import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createClient } from '$lib/supabase/server';
import { requireAuth } from '$lib/middleware/session';
import { getBook } from '$lib/server/api/books/get';
import { formatError, NotFoundError, AuthenticationError } from '$lib/utils/errors';

/**
 * Get a single book by ID
 * GET /api/books/[bookId]
 */
export const GET: RequestHandler = async (event) => {
	try {
		// Require authentication
		await requireAuth(event);

		const { bookId } = event.params;
		if (!bookId) {
			return json({ error: 'Book ID is required' }, { status: 400 });
		}

		const supabase = createClient(event);

		try {
			const book = await getBook(supabase, bookId);
			return json(book);
		} catch (error) {
			if (error instanceof Error && error.message === 'Book not found') {
				throw new NotFoundError('Book not found');
			}
			throw error;
		}
	} catch (err) {
		const formattedError = formatError(err);
		const statusCode =
			err instanceof AuthenticationError
				? 401
				: err instanceof NotFoundError
					? 404
					: 500;
		return json(formattedError, { status: statusCode });
	}
};



