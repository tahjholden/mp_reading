/**
 * Get a single book by ID
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '$lib/supabase/types';

type Book = Database['public']['Tables']['books']['Row'];

/**
 * Get a single book by ID
 */
export async function getBook(supabase: SupabaseClient, bookId: string): Promise<Book> {
	const { data, error } = await supabase
		.from('books')
		.select('*')
		.eq('id', bookId)
		.eq('is_active', true)
		.single();

	if (error) {
		if (error.code === 'PGRST116') {
			throw new Error('Book not found');
		}
		throw new Error(`Failed to fetch book: ${error.message}`);
	}

	if (!data) {
		throw new Error('Book not found');
	}

	return data as Book;
}



