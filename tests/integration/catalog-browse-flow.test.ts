/**
 * Integration test for catalog browsing flow
 * Tests the complete catalog browsing experience
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:5173';

describe('Catalog Browsing Flow Integration', () => {
	let supabase: ReturnType<typeof createClient>;
	let parentToken: string;
	let childToken: string;
	let childId: string;
	let testBookIds: string[] = [];

	beforeAll(async () => {
		supabase = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
			db: { schema: 'mp_reading' }
		});

		// Create parent account
		const testEmail = `catalog-parent-${Date.now()}@example.com`;
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
				parentToken = signInData.session.access_token;

				// Create parent profile
				await supabase.from('parents').insert({
					id: signUpData.user.id,
					email: testEmail
				});

				// Create child account
				const { data: childSignUp } = await supabase.auth.signUp({
					email: `catalog-child-${Date.now()}@example.com`,
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
					const { data: childData } = await supabase
						.from('children')
						.insert({
							id: childSignUp.user.id,
							primary_parent_id: signUpData.user.id,
							name: 'Catalog Test Child',
							age: 10,
							grade_level: 5,
							username: `catalog-child-${Date.now()}`,
							password_hash: 'hashed',
							onboarding_completed: true
						})
						.select()
						.single();

					if (childData) {
						childId = childData.id;
					}
				}

				// Create test books
				const books = [
					{
						title: 'Adventure Quest',
						author: 'Adventure Writer',
						genre: ['Adventure'],
						reading_level_min: 500,
						reading_level_max: 700,
						lexile_score: 600,
						grade_level_min: 4,
						grade_level_max: 5,
						summary: 'An exciting adventure story',
						is_active: true
					},
					{
						title: 'Mystery Solved',
						author: 'Mystery Writer',
						genre: ['Mystery'],
						reading_level_min: 600,
						reading_level_max: 800,
						lexile_score: 700,
						grade_level_min: 5,
						grade_level_max: 6,
						summary: 'A mysterious puzzle to solve',
						is_active: true
					},
					{
						title: 'Fantasy Journey',
						author: 'Fantasy Writer',
						genre: ['Fantasy', 'Adventure'],
						reading_level_min: 550,
						reading_level_max: 750,
						lexile_score: 650,
						grade_level_min: 4,
						grade_level_max: 6,
						summary: 'A magical fantasy adventure',
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

	it('should allow authenticated child to browse catalog', async () => {
		const response = await fetch(`${BASE_URL}/api/books`, {
			headers: {
				Authorization: `Bearer ${childToken}`
			}
		});

		expect(response.status).toBe(200);
		const data = await response.json();
		expect(data).toHaveProperty('books');
		expect(data).toHaveProperty('pagination');
		expect(Array.isArray(data.books)).toBe(true);
		expect(data.books.length).toBeGreaterThan(0);
	});

	it('should display books with required information', async () => {
		const response = await fetch(`${BASE_URL}/api/books`, {
			headers: {
				Authorization: `Bearer ${childToken}`
			}
		});

		expect(response.status).toBe(200);
		const data = await response.json();

		if (data.books.length > 0) {
			const book = data.books[0];
			expect(book).toHaveProperty('id');
			expect(book).toHaveProperty('title');
			expect(book).toHaveProperty('author');
			expect(book).toHaveProperty('genre');
			expect(book).toHaveProperty('is_active');
			expect(book.is_active).toBe(true);
		}
	});

	it('should support pagination through catalog', async () => {
		// Get first page
		const page1Response = await fetch(`${BASE_URL}/api/books?page=1&limit=2`, {
			headers: {
				Authorization: `Bearer ${childToken}`
			}
		});

		expect(page1Response.status).toBe(200);
		const page1Data = await page1Response.json();
		expect(page1Data.pagination.page).toBe(1);
		expect(page1Data.pagination.limit).toBe(2);
		expect(page1Data.books.length).toBeLessThanOrEqual(2);

		// Get second page
		if (page1Data.pagination.total_pages > 1) {
			const page2Response = await fetch(`${BASE_URL}/api/books?page=2&limit=2`, {
				headers: {
					Authorization: `Bearer ${childToken}`
				}
			});

			expect(page2Response.status).toBe(200);
			const page2Data = await page2Response.json();
			expect(page2Data.pagination.page).toBe(2);
			expect(page2Data.books.length).toBeGreaterThan(0);
		}
	});

	it('should allow child to view book details', async () => {
		if (testBookIds.length > 0) {
			const bookId = testBookIds[0];
			const response = await fetch(`${BASE_URL}/api/books/${bookId}`, {
				headers: {
					Authorization: `Bearer ${childToken}`
				}
			});

			expect(response.status).toBe(200);
			const data = await response.json();
			expect(data.id).toBe(bookId);
			expect(data).toHaveProperty('title');
			expect(data).toHaveProperty('author');
			expect(data).toHaveProperty('summary');
			expect(data).toHaveProperty('genre');
			expect(data).toHaveProperty('reading_level_min');
			expect(data).toHaveProperty('reading_level_max');
		}
	});

	it('should prevent unauthenticated access to catalog', async () => {
		const response = await fetch(`${BASE_URL}/api/books`);

		expect(response.status).toBe(401);
	});

	it('should return consistent pagination metadata', async () => {
		const response = await fetch(`${BASE_URL}/api/books?page=1&limit=10`, {
			headers: {
				Authorization: `Bearer ${childToken}`
			}
		});

		expect(response.status).toBe(200);
		const data = await response.json();
		expect(data.pagination).toHaveProperty('page');
		expect(data.pagination).toHaveProperty('limit');
		expect(data.pagination).toHaveProperty('total');
		expect(data.pagination).toHaveProperty('total_pages');
		expect(data.pagination.page).toBe(1);
		expect(data.pagination.limit).toBe(10);
		expect(data.pagination.total).toBeGreaterThanOrEqual(0);
		expect(data.pagination.total_pages).toBeGreaterThanOrEqual(0);
	});

	afterAll(async () => {
		// Cleanup test books
		if (testBookIds.length > 0) {
			await supabase.from('books').delete().in('id', testBookIds);
		}
		if (childId) {
			await supabase.from('children').delete().eq('id', childId);
		}
		await supabase.auth.signOut();
	});
});

