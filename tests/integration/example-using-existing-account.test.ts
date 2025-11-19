/**
 * Example test using existing account
 * This shows how to use your real account (tahjholden@gmail.com) in tests
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { useExistingParent, getExistingChild } from '../utils/test-helpers';
import { TEST_CREDENTIALS } from '../utils/test-credentials';
import type { TestParent, TestChild } from '../utils/test-helpers';

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:5173';

describe('Example: Using Existing Account', () => {
	let parent: TestParent;
	let child: TestChild | null;

	beforeAll(async () => {
		// Use your existing parent account
		parent = await useExistingParent(
			TEST_CREDENTIALS.parent.email,
			TEST_CREDENTIALS.parent.password
		);

		// Get your existing child account
		child = await getExistingChild(parent.id, TEST_CREDENTIALS.child.username);
	});

	it('should authenticate with existing parent account', async () => {
		expect(parent).toBeDefined();
		expect(parent.email).toBe(TEST_CREDENTIALS.parent.email);
		expect(parent.authToken).toBeDefined();
	});

	it('should access books API with existing account', async () => {
		const response = await fetch(`${BASE_URL}/api/books`, {
			headers: {
				Authorization: `Bearer ${parent.authToken}`
			}
		});

		expect(response.status).toBe(200);
		const data = await response.json();
		expect(data).toHaveProperty('books');
		expect(data).toHaveProperty('pagination');
	});

	it('should have access to existing child', () => {
		expect(child).not.toBeNull();
		if (child) {
			expect(child.username).toBe(TEST_CREDENTIALS.child.username);
		}
	});

	afterAll(async () => {
		// Sign out (but don't delete your real account!)
		await parent.supabase.auth.signOut();
	});
});

