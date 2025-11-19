/**
 * Integration test for book detail page flow
 * Tests the complete book detail viewing experience
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:5173';

describe('Book Detail Flow Integration', () => {
	let supabase: ReturnType<typeof createClient>;
	let childToken: string;
	let testBookId: string;

	beforeAll(async () => {
		supabase = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
			db: { schema: 'mp_reading' }
		});

		// Create parent account
		const testEmail = `detail-parent-${Date.now()}@example.com`;
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
					email: `detail-child-${Date.now()}@example.com`,
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
						name: 'Detail Test Child',
						age: 10,
						grade_level: 5,
						username: `detail-child-${Date.now()}`,
						password_hash: 'hashed',
						onboarding_completed: true
					});
				}

				// Create a detailed test book
				const { data: bookData } = await supabase
					.from('books')
					.insert({
						title: 'The Complete Test Book',
						author: 'Test Author Name',
						genre: ['Adventure', 'Fantasy'],
						reading_level_min: 500,
						reading_level_max: 700,
						lexile_score: 600,
						grade_level_min: 4,
						grade_level_max: 5,
						word_count: 50000,
						page_count: 200,
						estimated_reading_minutes: 120,
						summary: 'This is a comprehensive test book with all metadata fields populated for testing the book detail page functionality.',
						cover_image_url: 'https://example.com/cover.jpg',
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

	it('should display complete book details', async () => {
		const response = await fetch(`${BASE_URL}/api/books/${testBookId}`, {
			headers: {
				Authorization: `Bearer ${childToken}`
			}
		});

		expect(response.status).toBe(200);
		const data = await response.json();
		expect(data.id).toBe(testBookId);
		expect(data.title).toBe('The Complete Test Book');
		expect(data.author).toBe('Test Author Name');
		expect(data.summary).toBeDefined();
		expect(Array.isArray(data.genre)).toBe(true);
		expect(data.genre).toContain('Adventure');
		expect(data.genre).toContain('Fantasy');
	});

	it('should display reading level information', async () => {
		const response = await fetch(`${BASE_URL}/api/books/${testBookId}`, {
			headers: {
				Authorization: `Bearer ${childToken}`
			}
		});

		expect(response.status).toBe(200);
		const data = await response.json();
		expect(data).toHaveProperty('reading_level_min');
		expect(data).toHaveProperty('reading_level_max');
		expect(data).toHaveProperty('lexile_score');
		expect(data).toHaveProperty('grade_level_min');
		expect(data).toHaveProperty('grade_level_max');
		expect(data.reading_level_min).toBe(500);
		expect(data.reading_level_max).toBe(700);
		expect(data.lexile_score).toBe(600);
	});

	it('should display book statistics', async () => {
		const response = await fetch(`${BASE_URL}/api/books/${testBookId}`, {
			headers: {
				Authorization: `Bearer ${childToken}`
			}
		});

		expect(response.status).toBe(200);
		const data = await response.json();
		expect(data).toHaveProperty('word_count');
		expect(data).toHaveProperty('page_count');
		expect(data).toHaveProperty('estimated_reading_minutes');
		expect(data.word_count).toBe(50000);
		expect(data.page_count).toBe(200);
		expect(data.estimated_reading_minutes).toBe(120);
	});

	it('should display cover image URL', async () => {
		const response = await fetch(`${BASE_URL}/api/books/${testBookId}`, {
			headers: {
				Authorization: `Bearer ${childToken}`
			}
		});

		expect(response.status).toBe(200);
		const data = await response.json();
		expect(data).toHaveProperty('cover_image_url');
		expect(data.cover_image_url).toBe('https://example.com/cover.jpg');
	});

	it('should return 404 for non-existent book', async () => {
		const fakeId = '00000000-0000-0000-0000-000000000000';
		const response = await fetch(`${BASE_URL}/api/books/${fakeId}`, {
			headers: {
				Authorization: `Bearer ${childToken}`
			}
		});

		expect(response.status).toBe(404);
		const data = await response.json();
		expect(data).toHaveProperty('error');
	});

	it('should prevent viewing inactive books', async () => {
		// Create an inactive book
		const { data: inactiveBook } = await supabase
			.from('books')
			.insert({
				title: 'Inactive Book',
				author: 'Test Author',
				genre: ['Adventure'],
				reading_level_min: 500,
				reading_level_max: 700,
				is_active: false
			})
			.select()
			.single();

		if (inactiveBook) {
			const response = await fetch(`${BASE_URL}/api/books/${inactiveBook.id}`, {
				headers: {
					Authorization: `Bearer ${childToken}`
				}
			});

			expect(response.status).toBe(404);

			// Cleanup
			await supabase.from('books').delete().eq('id', inactiveBook.id);
		}
	});

	it('should require authentication to view book details', async () => {
		const response = await fetch(`${BASE_URL}/api/books/${testBookId}`);

		expect(response.status).toBe(401);
	});

	it('should allow navigation from catalog to detail page', async () => {
		// First, get a book from the catalog
		const catalogResponse = await fetch(`${BASE_URL}/api/books`, {
			headers: {
				Authorization: `Bearer ${childToken}`
			}
		});

		expect(catalogResponse.status).toBe(200);
		const catalogData = await catalogResponse.json();

		if (catalogData.books.length > 0) {
			const bookFromCatalog = catalogData.books[0];

			// Then, get the detail for that book
			const detailResponse = await fetch(`${BASE_URL}/api/books/${bookFromCatalog.id}`, {
				headers: {
					Authorization: `Bearer ${childToken}`
				}
			});

			expect(detailResponse.status).toBe(200);
			const detailData = await detailResponse.json();
			expect(detailData.id).toBe(bookFromCatalog.id);
			expect(detailData.title).toBe(bookFromCatalog.title);
		}
	});

	afterAll(async () => {
		// Cleanup test book
		if (testBookId) {
			await supabase.from('books').delete().eq('id', testBookId);
		}
		await supabase.auth.signOut();
	});
});

