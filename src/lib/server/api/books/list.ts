/**
 * List books with filtering and pagination
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '$lib/supabase/types';

type Book = Database['public']['Tables']['books']['Row'];

export interface ListBooksParams {
	genre?: string[];
	reading_level_min?: number;
	reading_level_max?: number;
	grade_level?: number;
	search?: string;
	page?: number;
	limit?: number;
}

export interface ListBooksResult {
	books: Book[];
	pagination: {
		page: number;
		limit: number;
		total: number;
		total_pages: number;
	};
}

/**
 * List books with optional filtering and pagination
 */
export async function listBooks(
	supabase: SupabaseClient,
	params: ListBooksParams = {}
): Promise<ListBooksResult> {
	const page = params.page || 1;
	const limit = Math.min(params.limit || 20, 100); // Max 100 per page
	const offset = (page - 1) * limit;

	let query = supabase
		.from('books')
		.select('*', { count: 'exact' })
		.eq('is_active', true)
		.order('created_at', { ascending: false })
		.range(offset, offset + limit - 1);

	// Apply genre filter
	if (params.genre && params.genre.length > 0) {
		query = query.contains('genre', params.genre);
	}

	// Apply reading level filter
	if (params.reading_level_min !== undefined) {
		query = query.gte('reading_level_max', params.reading_level_min);
	}
	if (params.reading_level_max !== undefined) {
		query = query.lte('reading_level_min', params.reading_level_max);
	}

	// Apply grade level filter
	if (params.grade_level !== undefined) {
		query = query.lte('grade_level_min', params.grade_level).gte('grade_level_max', params.grade_level);
	}

	// Apply search filter (full-text search)
	if (params.search) {
		const searchTerm = params.search.trim();
		if (searchTerm.length > 0) {
			query = query.or(
				`title.ilike.%${searchTerm}%,author.ilike.%${searchTerm}%,summary.ilike.%${searchTerm}%`
			);
		}
	}

	const { data, error, count } = await query;

	if (error) {
		throw new Error(`Failed to fetch books: ${error.message}`);
	}

	const total = count || 0;
	const total_pages = Math.ceil(total / limit);

	return {
		books: (data as Book[]) || [],
		pagination: {
			page,
			limit,
			total,
			total_pages
		}
	};
}



