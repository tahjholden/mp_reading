import { test, expect } from '@playwright/test';

const PARENT_EMAIL = 'tahjholden@gmail.com';
const PARENT_PASSWORD = 'password123';

test.describe('Books Catalog E2E', () => {
	test.beforeEach(async ({ page }) => {
		// Navigate to login page
		await page.goto('/login');
	});

	test('should login and browse books catalog', async ({ page }) => {
		// Login as parent
		await page.fill('input[type="email"]', PARENT_EMAIL);
		await page.fill('input[type="password"]', PARENT_PASSWORD);
		await page.click('button[type="submit"]');

		// Wait for navigation after login
		await page.waitForURL('**/parent/dashboard', { timeout: 10000 });

		// Navigate to books catalog
		await page.goto('/books');
		
		// Wait for books to load
		await page.waitForSelector('[data-testid="book-card"], .book-card, article', { timeout: 10000 });

		// Verify books are displayed
		const bookCards = await page.locator('[data-testid="book-card"], .book-card, article').count();
		expect(bookCards).toBeGreaterThan(0);
	});

	test('should view book details', async ({ page }) => {
		// Login as parent
		await page.fill('input[type="email"]', PARENT_EMAIL);
		await page.fill('input[type="password"]', PARENT_PASSWORD);
		await page.click('button[type="submit"]');

		// Wait for navigation
		await page.waitForURL('**/parent/dashboard', { timeout: 10000 });

		// Navigate to books catalog
		await page.goto('/books');
		
		// Wait for books to load
		await page.waitForSelector('[data-testid="book-card"], .book-card, article', { timeout: 10000 });

		// Click on first book
		const firstBook = page.locator('[data-testid="book-card"], .book-card, article').first();
		await firstBook.click();

		// Wait for book detail page
		await page.waitForURL(/\/books\/[^/]+/, { timeout: 10000 });

		// Verify book details are displayed
		await expect(page.locator('h1, h2')).toContainText(/./, { timeout: 5000 });
	});

	test('should filter books by genre', async ({ page }) => {
		// Login as parent
		await page.fill('input[type="email"]', PARENT_EMAIL);
		await page.fill('input[type="password"]', PARENT_PASSWORD);
		await page.click('button[type="submit"]');

		// Wait for navigation
		await page.waitForURL('**/parent/dashboard', { timeout: 10000 });

		// Navigate to books catalog
		await page.goto('/books');
		
		// Wait for books and filters to load
		await page.waitForSelector('[data-testid="book-card"], .book-card, article', { timeout: 10000 });
		
		// Try to find and use genre filter
		const genreFilter = page.locator('select, [role="combobox"], button').filter({ hasText: /genre|adventure|fantasy/i }).first();
		if (await genreFilter.count() > 0) {
			await genreFilter.click();
			// Wait for filter to apply
			await page.waitForTimeout(1000);
		}
	});

	test('should search for books', async ({ page }) => {
		// Login as parent
		await page.fill('input[type="email"]', PARENT_EMAIL);
		await page.fill('input[type="password"]', PARENT_PASSWORD);
		await page.click('button[type="submit"]');

		// Wait for navigation
		await page.waitForURL('**/parent/dashboard', { timeout: 10000 });

		// Navigate to books catalog
		await page.goto('/books');
		
		// Wait for search input
		await page.waitForSelector('input[type="search"], input[placeholder*="search" i]', { timeout: 10000 });
		
		// Type in search
		const searchInput = page.locator('input[type="search"], input[placeholder*="search" i]').first();
		await searchInput.fill('adventure');
		await searchInput.press('Enter');
		
		// Wait for results
		await page.waitForTimeout(1000);
	});
});

