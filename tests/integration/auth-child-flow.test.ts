/**
 * Integration test for child login flow
 * Tests the complete authentication flow for children (username/password)
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
import { hashPassword, verifyPassword } from '$lib/utils/password';

describe('Child Login Flow Integration', () => {
	let supabase: ReturnType<typeof createClient>;
	const testUsername = `testchild-${Date.now()}`;
	const testPassword = 'TestPassword123!';
	let passwordHash: string;
	let childId: string;
	let parentId: string;

	beforeAll(async () => {
		supabase = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY);
		
		// Create a test parent first
		const { data: parentData } = await supabase.auth.signUp({
			email: `parent-${Date.now()}@example.com`,
			password: 'ParentPassword123!',
			options: {
				data: { user_type: 'parent' }
			}
		});
		parentId = parentData.user?.id || '';

		// Hash password for child
		passwordHash = await hashPassword(testPassword);
	});

	it('should create a child profile with hashed password', async () => {
		// This will be implemented when child creation endpoint exists
		// For now, test password hashing
		expect(passwordHash).toBeDefined();
		expect(passwordHash).not.toBe(testPassword);
	});

	it('should verify password against hash', async () => {
		const isValid = await verifyPassword(testPassword, passwordHash);
		expect(isValid).toBe(true);

		const isInvalid = await verifyPassword('WrongPassword', passwordHash);
		expect(isInvalid).toBe(false);
	});

	it('should log in child with username and password', async () => {
		// This test will fail until child login endpoint is implemented
		const response = await fetch('/api/auth/child/login', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				username: testUsername,
				password: testPassword
			})
		});

		// Will fail until implementation
		expect(response.status).toBe(200);
	});
});

