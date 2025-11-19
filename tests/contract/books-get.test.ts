/**
 * Contract tests for get book endpoint
 * Tests the API contract without full integration
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:5173';

describe('Get Book API Contract', () => {
	let supabase: ReturnType<typeof createClient>;
	let authToken: string;
	let testBookId: string;

	beforeAll(async () => {
		supabase = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
			db: { schema: 'mp_reading' }
		});

		// Create a test parent account for authentication
		const testEmail = `book-get-test-${Date.now()}@example.com`;
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

				// Create a test book
				const { data: bookData } = await supabase
					.from('books')
					.insert({
						title: 'Test Book for Get',
						author: 'Test Author',
						genre: ['Adventure', 'Fantasy'],
						reading_level_min: 500,
						reading_level_max: 700,
						lexile_score: 600,
						grade_level_min: 4,
						grade_level_max: 5,
						word_count: 50000,
						page_count: 200,
						summary: 'A test book for getting details',
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

	it('should return book details for valid book ID', async () => {
		const response = await fetch(`${BASE_URL}/api/books/${testBookId}`, {
			headers: {
				Authorization: `Bearer ${authToken}`
			}
		});

		expect(response.status).toBe(200);
		const data = await response.json();
		expect(data).toHaveProperty('id');
		expect(data).toHaveProperty('title');
		expect(data).toHaveProperty('author');
		expect(data.id).toBe(testBookId);
		expect(data.title).toBe('Test Book for Get');
	});

	it('should return all required book fields', async () => {
		const response = await fetch(`${BASE_URL}/api/books/${testBookId}`, {
			headers: {
				Authorization: `Bearer ${authToken}`
			}
		});

		expect(response.status).toBe(200);
		const data = await response.json();
		expect(data).toHaveProperty('id');
		expect(data).toHaveProperty('title');
		expect(data).toHaveProperty('author');
		expect(data).toHaveProperty('genre');
		expect(data).toHaveProperty('is_active');
		expect(Array.isArray(data.genre)).toBe(true);
	});

	it('should return 404 for non-existent book ID', async () => {
		const fakeId = '00000000-0000-0000-0000-000000000000';
		const response = await fetch(`${BASE_URL}/api/books/${fakeId}`, {
			headers: {
				Authorization: `Bearer ${authToken}`
			}
		});

		expect(response.status).toBe(404);
		const data = await response.json();
		expect(data).toHaveProperty('error');
	});

	it('should return 400 for invalid book ID format', async () => {
		const response = await fetch(`${BASE_URL}/api/books/invalid-id`, {
			headers: {
				Authorization: `Bearer ${authToken}`
			}
		});

		// Should return 400 or 404 depending on validation
		expect([400, 404]).toContain(response.status);
	});

	it('should return 401 for unauthenticated requests', async () => {
		const response = await fetch(`${BASE_URL}/api/books/${testBookId}`);

		expect(response.status).toBe(401);
	});

	it('should not return inactive books', async () => {
		// Create an inactive book
		const { data: inactiveBook } = await supabase
			.from('books')
			.insert({
				title: 'Inactive Test Book',
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
					Authorization: `Bearer ${authToken}`
				}
			});

			// Should return 404 for inactive books
			expect(response.status).toBe(404);
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

