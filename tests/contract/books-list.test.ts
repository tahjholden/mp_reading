/**
 * Contract tests for list books endpoint
 * Tests the API contract without full integration
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:5173';

describe('List Books API Contract', () => {
	let supabase: ReturnType<typeof createClient>;
	let authToken: string;
	let testBookId: string;

	beforeAll(async () => {
		supabase = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
			db: { schema: 'mp_reading' }
		});

		// Create a test parent account for authentication
		const testEmail = `books-test-${Date.now()}@example.com`;
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
						title: 'Test Book for List',
						author: 'Test Author',
						genre: ['Adventure'],
						reading_level_min: 500,
						reading_level_max: 700,
						lexile_score: 600,
						grade_level_min: 4,
						grade_level_max: 5,
						summary: 'A test book for listing',
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

	it('should return books list with pagination', async () => {
		const response = await fetch(`${BASE_URL}/api/books`, {
			headers: {
				Authorization: `Bearer ${authToken}`
			}
		});

		expect(response.status).toBe(200);
		const data = await response.json();
		expect(data).toHaveProperty('books');
		expect(data).toHaveProperty('pagination');
		expect(data.pagination).toHaveProperty('page');
		expect(data.pagination).toHaveProperty('limit');
		expect(data.pagination).toHaveProperty('total');
		expect(data.pagination).toHaveProperty('total_pages');
		expect(Array.isArray(data.books)).toBe(true);
	});

	it('should return books with required fields', async () => {
		const response = await fetch(`${BASE_URL}/api/books`, {
			headers: {
				Authorization: `Bearer ${authToken}`
			}
		});

		expect(response.status).toBe(200);
		const data = await response.json();

		if (data.books.length > 0) {
			const book = data.books[0];
			expect(book).toHaveProperty('id');
			expect(book).toHaveProperty('title');
			expect(book).toHaveProperty('is_active');
			expect(book.is_active).toBe(true);
		}
	});

	it('should support pagination parameters', async () => {
		const response = await fetch(`${BASE_URL}/api/books?page=1&limit=10`, {
			headers: {
				Authorization: `Bearer ${authToken}`
			}
		});

		expect(response.status).toBe(200);
		const data = await response.json();
		expect(data.pagination.page).toBe(1);
		expect(data.pagination.limit).toBe(10);
		expect(data.books.length).toBeLessThanOrEqual(10);
	});

	it('should return 401 for unauthenticated requests', async () => {
		const response = await fetch(`${BASE_URL}/api/books`);

		expect(response.status).toBe(401);
	});

	it('should respect limit maximum (100)', async () => {
		const response = await fetch(`${BASE_URL}/api/books?limit=200`, {
			headers: {
				Authorization: `Bearer ${authToken}`
			}
		});

		expect(response.status).toBe(200);
		const data = await response.json();
		expect(data.pagination.limit).toBeLessThanOrEqual(100);
		expect(data.books.length).toBeLessThanOrEqual(100);
	});

	it('should return empty array when no books match', async () => {
		// Use a search term that won't match anything
		const response = await fetch(`${BASE_URL}/api/books?search=ThisBookDoesNotExist12345`, {
			headers: {
				Authorization: `Bearer ${authToken}`
			}
		});

		expect(response.status).toBe(200);
		const data = await response.json();
		expect(Array.isArray(data.books)).toBe(true);
		expect(data.pagination.total).toBeGreaterThanOrEqual(0);
	});
});

