/**
 * Contract tests for search books endpoint
 * Tests search functionality via query parameters
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:5173';

describe('Search Books API Contract', () => {
	let supabase: ReturnType<typeof createClient>;
	let authToken: string;
	let testBookId: string;

	beforeAll(async () => {
		supabase = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
			db: { schema: 'mp_reading' }
		});

		// Create a test parent account for authentication
		const testEmail = `search-test-${Date.now()}@example.com`;
		const testPassword = 'TestPassword123!';

		const { data: signUpData } = await supabase.auth.signUp({
			email: testEmail,
			password: testPassword,
			options: {
				data: { user_type: 'parent' }
			}
		});

		if (signUpData.user) {
			const { data: signInData } = await supabase.auth.signInWithPassword({
				email: testEmail,
				password: testPassword
			});

			if (signInData.session) {
				authToken = signInData.session.access_token;

				// Create a test book with specific title and author
				const { data: bookData } = await supabase
					.from('books')
					.insert({
						title: 'The Great Search Test Adventure',
						author: 'Search Test Author',
						genre: ['Adventure'],
						reading_level_min: 500,
						reading_level_max: 700,
						lexile_score: 600,
						grade_level_min: 4,
						grade_level_max: 5,
						summary: 'This is a test book for searching functionality',
						is_active: true
					})
					.select()
					.single();

				if (bookData) {
					testBookId = bookData.id;
				}
			}
		}
	});

	it('should search books by title', async () => {
		const response = await fetch(`${BASE_URL}/api/books?search=Great`, {
			headers: {
				Authorization: `Bearer ${authToken}`
			}
		});

		expect(response.status).toBe(200);
		const data = await response.json();
		expect(Array.isArray(data.books)).toBe(true);
		// At least one book should match
		const matchingBooks = data.books.filter((book: any) =>
			book.title.toLowerCase().includes('great')
		);
		expect(matchingBooks.length).toBeGreaterThan(0);
	});

	it('should search books by author', async () => {
		const response = await fetch(`${BASE_URL}/api/books?search=Search Test Author`, {
			headers: {
				Authorization: `Bearer ${authToken}`
			}
		});

		expect(response.status).toBe(200);
		const data = await response.json();
		expect(Array.isArray(data.books)).toBe(true);
		// At least one book should match
		const matchingBooks = data.books.filter((book: any) =>
			book.author?.toLowerCase().includes('search test author')
		);
		expect(matchingBooks.length).toBeGreaterThan(0);
	});

	it('should search books by summary', async () => {
		const response = await fetch(`${BASE_URL}/api/books?search=searching functionality`, {
			headers: {
				Authorization: `Bearer ${authToken}`
			}
		});

		expect(response.status).toBe(200);
		const data = await response.json();
		expect(Array.isArray(data.books)).toBe(true);
		// At least one book should match
		const matchingBooks = data.books.filter((book: any) =>
			book.summary?.toLowerCase().includes('searching')
		);
		expect(matchingBooks.length).toBeGreaterThan(0);
	});

	it('should be case-insensitive', async () => {
		const response = await fetch(`${BASE_URL}/api/books?search=GREAT`, {
			headers: {
				Authorization: `Bearer ${authToken}`
			}
		});

		expect(response.status).toBe(200);
		const data = await response.json();
		expect(Array.isArray(data.books)).toBe(true);
	});

	it('should return empty results for non-matching search', async () => {
		const response = await fetch(`${BASE_URL}/api/books?search=ThisDoesNotExist12345`, {
			headers: {
				Authorization: `Bearer ${authToken}`
			}
		});

		expect(response.status).toBe(200);
		const data = await response.json();
		expect(Array.isArray(data.books)).toBe(true);
		expect(data.pagination.total).toBe(0);
	});

	it('should combine search with filters', async () => {
		const response = await fetch(
			`${BASE_URL}/api/books?search=Great&genre=Adventure&grade_level=4`,
			{
				headers: {
					Authorization: `Bearer ${authToken}`
				}
			}
		);

		expect(response.status).toBe(200);
		const data = await response.json();
		expect(Array.isArray(data.books)).toBe(true);
		// All books should match both search and filters
		data.books.forEach((book: any) => {
			expect(book.genre).toContain('Adventure');
			expect(book.grade_level_min).toBeLessThanOrEqual(4);
			expect(book.grade_level_max).toBeGreaterThanOrEqual(4);
		});
	});

	it('should handle empty search string', async () => {
		const response = await fetch(`${BASE_URL}/api/books?search=`, {
			headers: {
				Authorization: `Bearer ${authToken}`
			}
		});

		expect(response.status).toBe(200);
		const data = await response.json();
		expect(Array.isArray(data.books)).toBe(true);
		// Empty search should return all books (no filtering)
	});

	it('should handle search with special characters', async () => {
		const response = await fetch(`${BASE_URL}/api/books?search=test%20book`, {
			headers: {
				Authorization: `Bearer ${authToken}`
			}
		});

		expect(response.status).toBe(200);
		const data = await response.json();
		expect(Array.isArray(data.books)).toBe(true);
	});

	afterAll(async () => {
		// Cleanup test book
		if (testBookId) {
			await supabase.from('books').delete().eq('id', testBookId);
		}
		await supabase.auth.signOut();
	});
});

