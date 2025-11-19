/**
 * Integration test for catalog filtering flow
 * Tests the complete filtering experience
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:5173';

describe('Catalog Filter Flow Integration', () => {
	let supabase: ReturnType<typeof createClient>;
	let childToken: string;
	let testBookIds: string[] = [];

	beforeAll(async () => {
		supabase = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
			db: { schema: 'mp_reading' }
		});

		// Create parent account
		const testEmail = `filter-flow-parent-${Date.now()}@example.com`;
		const testPassword = 'ParentPassword123!';

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
				// Create parent profile
				await supabase.from('parents').insert({
					id: signUpData.user.id,
					email: testEmail
				});

				// Create child account
				const { data: childSignUp } = await supabase.auth.signUp({
					email: `filter-flow-child-${Date.now()}@example.com`,
					password: 'ChildPassword123!',
					options: {
						data: { user_type: 'child' }
					}
				});

				if (childSignUp.user) {
					const { data: childSignIn } = await supabase.auth.signInWithPassword({
						email: childSignUp.user.email!,
						password: 'ChildPassword123!'
					});

					if (childSignIn.session) {
						childToken = childSignIn.session.access_token;
					}

					// Create child profile
					await supabase.from('children').insert({
						id: childSignUp.user.id,
						primary_parent_id: signUpData.user.id,
						name: 'Filter Flow Test Child',
						age: 10,
						grade_level: 5,
						username: `filter-flow-child-${Date.now()}`,
						password_hash: 'hashed',
						onboarding_completed: true
					});
				}

				// Create test books with different attributes
				const books = [
					{
						title: 'Adventure Book 1',
						author: 'Adventure Author',
						genre: ['Adventure'],
						reading_level_min: 500,
						reading_level_max: 600,
						lexile_score: 550,
						grade_level_min: 4,
						grade_level_max: 4,
						is_active: true
					},
					{
						title: 'Adventure Book 2',
						author: 'Adventure Author',
						genre: ['Adventure'],
						reading_level_min: 600,
						reading_level_max: 700,
						lexile_score: 650,
						grade_level_min: 5,
						grade_level_max: 5,
						is_active: true
					},
					{
						title: 'Mystery Book',
						author: 'Mystery Author',
						genre: ['Mystery'],
						reading_level_min: 550,
						reading_level_max: 650,
						lexile_score: 600,
						grade_level_min: 4,
						grade_level_max: 5,
						is_active: true
					},
					{
						title: 'Fantasy Book',
						author: 'Fantasy Author',
						genre: ['Fantasy'],
						reading_level_min: 700,
						reading_level_max: 800,
						lexile_score: 750,
						grade_level_min: 6,
						grade_level_max: 6,
						is_active: true
					}
				];

				for (const book of books) {
					const { data: bookData } = await supabase
						.from('books')
						.insert(book)
						.select()
						.single();

					if (bookData) {
						testBookIds.push(bookData.id);
					}
				}
			}
		}
	});

	it('should filter books by single genre', async () => {
		const response = await fetch(`${BASE_URL}/api/books?genre=Adventure`, {
			headers: {
				Authorization: `Bearer ${childToken}`
			}
		});

		expect(response.status).toBe(200);
		const data = await response.json();
		expect(Array.isArray(data.books)).toBe(true);
		// All books should have Adventure genre
		data.books.forEach((book: any) => {
			expect(book.genre).toContain('Adventure');
		});
	});

	it('should filter books by grade level', async () => {
		const response = await fetch(`${BASE_URL}/api/books?grade_level=4`, {
			headers: {
				Authorization: `Bearer ${childToken}`
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

	it('should filter books by reading level range', async () => {
		const response = await fetch(
			`${BASE_URL}/api/books?reading_level_min=500&reading_level_max=600`,
			{
				headers: {
					Authorization: `Bearer ${childToken}`
				}
			}
		);

		expect(response.status).toBe(200);
		const data = await response.json();
		expect(Array.isArray(data.books)).toBe(true);
		// All books should overlap with the range
		data.books.forEach((book: any) => {
			expect(book.reading_level_min).toBeLessThanOrEqual(600);
			expect(book.reading_level_max).toBeGreaterThanOrEqual(500);
		});
	});

	it('should combine multiple filters', async () => {
		const response = await fetch(
			`${BASE_URL}/api/books?genre=Adventure&grade_level=4&reading_level_min=500`,
			{
				headers: {
					Authorization: `Bearer ${childToken}`
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
				Authorization: `Bearer ${childToken}`
			}
		});

		expect(response.status).toBe(200);
		const data = await response.json();
		expect(Array.isArray(data.books)).toBe(true);
		expect(data.pagination.total).toBe(0);
	});

	it('should maintain pagination with filters', async () => {
		const response = await fetch(`${BASE_URL}/api/books?genre=Adventure&page=1&limit=1`, {
			headers: {
				Authorization: `Bearer ${childToken}`
			}
		});

		expect(response.status).toBe(200);
		const data = await response.json();
		expect(data.pagination.page).toBe(1);
		expect(data.pagination.limit).toBe(1);
		expect(data.books.length).toBeLessThanOrEqual(1);
		// Total should reflect filtered results
		expect(data.pagination.total).toBeGreaterThanOrEqual(0);
	});

	it('should allow clearing filters', async () => {
		// First, get filtered results
		const filteredResponse = await fetch(`${BASE_URL}/api/books?genre=Adventure`, {
			headers: {
				Authorization: `Bearer ${childToken}`
			}
		});

		const filteredData = await filteredResponse.json();
		const filteredCount = filteredData.pagination.total;

		// Then, get all results (no filters)
		const allResponse = await fetch(`${BASE_URL}/api/books`, {
			headers: {
				Authorization: `Bearer ${childToken}`
			}
		});

		const allData = await allResponse.json();
		const allCount = allData.pagination.total;

		// All results should be >= filtered results
		expect(allCount).toBeGreaterThanOrEqual(filteredCount);
	});

	afterAll(async () => {
		// Cleanup test books
		if (testBookIds.length > 0) {
			await supabase.from('books').delete().in('id', testBookIds);
		}
		await supabase.auth.signOut();
	});
});

