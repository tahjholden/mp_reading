/**
 * Contract tests for filtered books endpoint
 * Tests filtering functionality via query parameters
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:5173';

describe('Filter Books API Contract', () => {
	let supabase: ReturnType<typeof createClient>;
	let authToken: string;
	let adventureBookId: string;
	let mysteryBookId: string;

	beforeAll(async () => {
		supabase = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
			db: { schema: 'mp_reading' }
		});

		// Create a test parent account for authentication
		const testEmail = `filter-test-${Date.now()}@example.com`;
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

				// Create test books with different genres
				const { data: adventureBook } = await supabase
					.from('books')
					.insert({
						title: 'Adventure Book',
						author: 'Adventure Author',
						genre: ['Adventure'],
						reading_level_min: 500,
						reading_level_max: 700,
						lexile_score: 600,
						grade_level_min: 4,
						grade_level_max: 5,
						is_active: true
					})
					.select()
					.single();

				const { data: mysteryBook } = await supabase
					.from('books')
					.insert({
						title: 'Mystery Book',
						author: 'Mystery Author',
						genre: ['Mystery'],
						reading_level_min: 600,
						reading_level_max: 800,
						lexile_score: 700,
						grade_level_min: 5,
						grade_level_max: 6,
						is_active: true
					})
					.select()
					.single();

				if (adventureBook) adventureBookId = adventureBook.id;
				if (mysteryBook) mysteryBookId = mysteryBook.id;
			}
		}
	});

	it('should filter books by genre', async () => {
		const response = await fetch(`${BASE_URL}/api/books?genre=Adventure`, {
			headers: {
				Authorization: `Bearer ${authToken}`
			}
		});

		expect(response.status).toBe(200);
		const data = await response.json();
		expect(Array.isArray(data.books)).toBe(true);
		// All returned books should have Adventure genre
		data.books.forEach((book: any) => {
			expect(book.genre).toContain('Adventure');
		});
	});

	it('should filter books by multiple genres', async () => {
		const response = await fetch(`${BASE_URL}/api/books?genre=Adventure&genre=Mystery`, {
			headers: {
				Authorization: `Bearer ${authToken}`
			}
		});

		expect(response.status).toBe(200);
		const data = await response.json();
		expect(Array.isArray(data.books)).toBe(true);
		// Books should have at least one of the specified genres
		data.books.forEach((book: any) => {
			const hasGenre = book.genre.some((g: string) => ['Adventure', 'Mystery'].includes(g));
			expect(hasGenre).toBe(true);
		});
	});

	it('should filter books by reading level range', async () => {
		const response = await fetch(
			`${BASE_URL}/api/books?reading_level_min=500&reading_level_max=700`,
			{
				headers: {
					Authorization: `Bearer ${authToken}`
				}
			}
		);

		expect(response.status).toBe(200);
		const data = await response.json();
		expect(Array.isArray(data.books)).toBe(true);
		// All books should overlap with the specified range
		data.books.forEach((book: any) => {
			expect(book.reading_level_min).toBeLessThanOrEqual(700);
			expect(book.reading_level_max).toBeGreaterThanOrEqual(500);
		});
	});

	it('should filter books by grade level', async () => {
		const response = await fetch(`${BASE_URL}/api/books?grade_level=4`, {
			headers: {
				Authorization: `Bearer ${authToken}`
			}
		});

		expect(response.status).toBe(200);
		const data = await response.json();
		expect(Array.isArray(data.books)).toBe(true);
		// All books should be appropriate for grade 4
		data.books.forEach((book: any) => {
			expect(book.grade_level_min).toBeLessThanOrEqual(4);
			expect(book.grade_level_max).toBeGreaterThanOrEqual(4);
		});
	});

	it('should combine multiple filters', async () => {
		const response = await fetch(
			`${BASE_URL}/api/books?genre=Adventure&grade_level=4&reading_level_min=500`,
			{
				headers: {
					Authorization: `Bearer ${authToken}`
				}
			}
		);

		expect(response.status).toBe(200);
		const data = await response.json();
		expect(Array.isArray(data.books)).toBe(true);
		// All books should match all filters
		data.books.forEach((book: any) => {
			expect(book.genre).toContain('Adventure');
			expect(book.grade_level_min).toBeLessThanOrEqual(4);
			expect(book.grade_level_max).toBeGreaterThanOrEqual(4);
			expect(book.reading_level_max).toBeGreaterThanOrEqual(500);
		});
	});

	it('should return empty results for filters with no matches', async () => {
		const response = await fetch(`${BASE_URL}/api/books?genre=NonExistentGenre`, {
			headers: {
				Authorization: `Bearer ${authToken}`
			}
		});

		expect(response.status).toBe(200);
		const data = await response.json();
		expect(Array.isArray(data.books)).toBe(true);
		expect(data.pagination.total).toBe(0);
	});

	afterAll(async () => {
		// Cleanup test books
		if (adventureBookId) {
			await supabase.from('books').delete().eq('id', adventureBookId);
		}
		if (mysteryBookId) {
			await supabase.from('books').delete().eq('id', mysteryBookId);
		}
		await supabase.auth.signOut();
	});
});

