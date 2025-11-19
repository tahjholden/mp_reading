/**
 * Integration test for catalog search flow
 * Tests the complete search experience
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:5173';

describe('Catalog Search Flow Integration', () => {
	let supabase: ReturnType<typeof createClient>;
	let childToken: string;
	let testBookIds: string[] = [];

	beforeAll(async () => {
		supabase = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
			db: { schema: 'mp_reading' }
		});

		// Create parent account
		const testEmail = `search-flow-parent-${Date.now()}@example.com`;
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
					email: `search-flow-child-${Date.now()}@example.com`,
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
						name: 'Search Flow Test Child',
						age: 10,
						grade_level: 5,
						username: `search-flow-child-${Date.now()}`,
						password_hash: 'hashed',
						onboarding_completed: true
					});
				}

				// Create test books with searchable content
				const books = [
					{
						title: 'The Great Adventure Quest',
						author: 'Adventure Writer',
						genre: ['Adventure'],
						reading_level_min: 500,
						reading_level_max: 700,
						lexile_score: 600,
						grade_level_min: 4,
						grade_level_max: 5,
						summary: 'An exciting adventure story about quests and heroes',
						is_active: true
					},
					{
						title: 'Mystery of the Lost Treasure',
						author: 'Mystery Writer',
						genre: ['Mystery'],
						reading_level_min: 600,
						reading_level_max: 800,
						lexile_score: 700,
						grade_level_min: 5,
						grade_level_max: 6,
						summary: 'A mysterious puzzle involving lost treasure and clues',
						is_active: true
					},
					{
						title: 'Fantasy Journey Through Time',
						author: 'Fantasy Writer',
						genre: ['Fantasy'],
						reading_level_min: 550,
						reading_level_max: 750,
						lexile_score: 650,
						grade_level_min: 4,
						grade_level_max: 6,
						summary: 'A magical fantasy adventure through different time periods',
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

	it('should search books by title', async () => {
		const response = await fetch(`${BASE_URL}/api/books?search=Great`, {
			headers: {
				Authorization: `Bearer ${childToken}`
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
		const response = await fetch(`${BASE_URL}/api/books?search=Adventure Writer`, {
			headers: {
				Authorization: `Bearer ${childToken}`
			}
		});

		expect(response.status).toBe(200);
		const data = await response.json();
		expect(Array.isArray(data.books)).toBe(true);
		// At least one book should match
		const matchingBooks = data.books.filter((book: any) =>
			book.author?.toLowerCase().includes('adventure writer')
		);
		expect(matchingBooks.length).toBeGreaterThan(0);
	});

	it('should search books by summary', async () => {
		const response = await fetch(`${BASE_URL}/api/books?search=treasure`, {
			headers: {
				Authorization: `Bearer ${childToken}`
			}
		});

		expect(response.status).toBe(200);
		const data = await response.json();
		expect(Array.isArray(data.books)).toBe(true);
		// At least one book should match
		const matchingBooks = data.books.filter(
			(book: any) =>
				book.summary?.toLowerCase().includes('treasure') ||
				book.title.toLowerCase().includes('treasure')
		);
		expect(matchingBooks.length).toBeGreaterThan(0);
	});

	it('should be case-insensitive', async () => {
		const lowerResponse = await fetch(`${BASE_URL}/api/books?search=great`, {
			headers: {
				Authorization: `Bearer ${childToken}`
			}
		});

		const upperResponse = await fetch(`${BASE_URL}/api/books?search=GREAT`, {
			headers: {
				Authorization: `Bearer ${childToken}`
			}
		});

		expect(lowerResponse.status).toBe(200);
		expect(upperResponse.status).toBe(200);

		const lowerData = await lowerResponse.json();
		const upperData = await upperResponse.json();

		// Results should be similar (may not be identical due to other books)
		expect(lowerData.pagination.total).toBe(upperData.pagination.total);
	});

	it('should return empty results for non-matching search', async () => {
		const response = await fetch(`${BASE_URL}/api/books?search=ThisDoesNotExist12345`, {
			headers: {
				Authorization: `Bearer ${childToken}`
			}
		});

		expect(response.status).toBe(200);
		const data = await response.json();
		expect(Array.isArray(data.books)).toBe(true);
		expect(data.pagination.total).toBe(0);
	});

	it('should combine search with filters', async () => {
		const response = await fetch(
			`${BASE_URL}/api/books?search=Adventure&genre=Adventure&grade_level=4`,
			{
				headers: {
					Authorization: `Bearer ${childToken}`
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
			// Book should match search term in title, author, or summary
			const searchMatch =
				book.title.toLowerCase().includes('adventure') ||
				book.author?.toLowerCase().includes('adventure') ||
				book.summary?.toLowerCase().includes('adventure');
			expect(searchMatch).toBe(true);
		});
	});

	it('should handle partial word matches', async () => {
		const response = await fetch(`${BASE_URL}/api/books?search=Quest`, {
			headers: {
				Authorization: `Bearer ${childToken}`
			}
		});

		expect(response.status).toBe(200);
		const data = await response.json();
		expect(Array.isArray(data.books)).toBe(true);
		// Should find "Quest" in "Adventure Quest"
		const matchingBooks = data.books.filter((book: any) =>
			book.title.toLowerCase().includes('quest')
		);
		expect(matchingBooks.length).toBeGreaterThan(0);
	});

	it('should maintain pagination with search', async () => {
		const response = await fetch(`${BASE_URL}/api/books?search=Adventure&page=1&limit=1`, {
			headers: {
				Authorization: `Bearer ${childToken}`
			}
		});

		expect(response.status).toBe(200);
		const data = await response.json();
		expect(data.pagination.page).toBe(1);
		expect(data.pagination.limit).toBe(1);
		expect(data.books.length).toBeLessThanOrEqual(1);
		// Total should reflect search results
		expect(data.pagination.total).toBeGreaterThanOrEqual(0);
	});

	it('should handle empty search string', async () => {
		const response = await fetch(`${BASE_URL}/api/books?search=`, {
			headers: {
				Authorization: `Bearer ${childToken}`
			}
		});

		expect(response.status).toBe(200);
		const data = await response.json();
		expect(Array.isArray(data.books)).toBe(true);
		// Empty search should return all books (no filtering)
	});

	afterAll(async () => {
		// Cleanup test books
		if (testBookIds.length > 0) {
			await supabase.from('books').delete().in('id', testBookIds);
		}
		await supabase.auth.signOut();
	});
});

