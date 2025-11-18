/**
 * Books store
 * Manages book catalog state
 */

import { writable, derived, type Writable } from 'svelte/store';

export interface Book {
	id: string;
	title: string;
	author: string | null;
	isbn: string | null;
	genre: string[];
	reading_level_min: number | null;
	reading_level_max: number | null;
	lexile_score: number | null;
	grade_level_min: number | null;
	grade_level_max: number | null;
	word_count: number | null;
	page_count: number | null;
	estimated_reading_minutes: number | null;
	cover_image_url: string | null;
	summary: string | null;
	content_url: string | null;
	content_format: string;
	metadata: Record<string, unknown>;
	is_active: boolean;
	created_at: string;
	updated_at: string;
}

export interface BookFilters {
	genre?: string[];
	reading_level_min?: number;
	reading_level_max?: number;
	grade_level?: number;
	search?: string;
}

export interface BookCatalogState {
	books: Book[];
	loading: boolean;
	error: string | null;
	filters: BookFilters;
	pagination: {
		page: number;
		limit: number;
		total: number;
		total_pages: number;
	};
}

const initialState: BookCatalogState = {
	books: [],
	loading: false,
	error: null,
	filters: {},
	pagination: {
		page: 1,
		limit: 20,
		total: 0,
		total_pages: 0
	}
};

function createBooksStore() {
	const { subscribe, set, update }: Writable<BookCatalogState> = writable(initialState);

	return {
		subscribe,
		setBooks: (books: Book[]) => {
			update((state) => ({ ...state, books }));
		},
		setLoading: (loading: boolean) => {
			update((state) => ({ ...state, loading }));
		},
		setError: (error: string | null) => {
			update((state) => ({ ...state, error }));
		},
		setFilters: (filters: BookFilters) => {
			update((state) => ({ ...state, filters }));
		},
		setPagination: (pagination: BookCatalogState['pagination']) => {
			update((state) => ({ ...state, pagination }));
		},
		reset: () => set(initialState),
		addBook: (book: Book) => {
			update((state) => ({
				...state,
				books: [...state.books, book]
			}));
		},
		updateBook: (bookId: string, updates: Partial<Book>) => {
			update((state) => ({
				...state,
				books: state.books.map((book) => (book.id === bookId ? { ...book, ...updates } : book))
			}));
		},
		removeBook: (bookId: string) => {
			update((state) => ({
				...state,
				books: state.books.filter((book) => book.id !== bookId)
			}));
		}
	};
}

export const booksStore = createBooksStore();

// Derived store for filtered books (client-side filtering if needed)
export const filteredBooks = derived([booksStore], ([$booksStore]) => {
	return $booksStore.books;
});



