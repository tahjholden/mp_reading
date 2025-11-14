/**
 * Integration test for parent login flow
 * Tests the complete authentication flow for parents
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';

describe('Parent Login Flow Integration', () => {
	let supabase: ReturnType<typeof createClient>;
	const testEmail = `test-${Date.now()}@example.com`;
	const testPassword = 'TestPassword123!';

	beforeAll(() => {
		supabase = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY);
	});

	it('should create a parent account and log in', async () => {
		// Create parent account via Supabase Auth
		const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
			email: testEmail,
			password: testPassword,
			options: {
				data: {
					user_type: 'parent'
				}
			}
		});

		expect(signUpError).toBeNull();
		expect(signUpData.user).toBeDefined();

		// Log in with created credentials
		const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
			email: testEmail,
			password: testPassword
		});

		expect(signInError).toBeNull();
		expect(signInData.user).toBeDefined();
		expect(signInData.session).toBeDefined();
	});

	it('should fail login with incorrect password', async () => {
		const { error } = await supabase.auth.signInWithPassword({
			email: testEmail,
			password: 'WrongPassword123!'
		});

		expect(error).toBeDefined();
		expect(error?.message).toContain('Invalid login credentials');
	});

	it('should maintain session across requests', async () => {
		// Sign in
		const { data: signInData } = await supabase.auth.signInWithPassword({
			email: testEmail,
			password: testPassword
		});

		expect(signInData.session).toBeDefined();

		// Get current session
		const { data: sessionData } = await supabase.auth.getSession();
		expect(sessionData.session).toBeDefined();
		expect(sessionData.session?.user?.email).toBe(testEmail);
	});

	afterAll(async () => {
		// Cleanup: Sign out
		await supabase.auth.signOut();
	});
});

