/**
 * Integration test for logout functionality
 * Tests that users can successfully log out and session is cleared
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';

describe('Logout', () => {
	let supabase: ReturnType<typeof createClient>;
	const testEmail = `logout-test-${Date.now()}@example.com`;
	const testPassword = 'LogoutTest123!';

	beforeAll(() => {
		supabase = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, { db: { schema: 'mp_reading' } });
	});

	it('should successfully log out authenticated user', async () => {
		// Create account and sign in
		await supabase.auth.signUp({
			email: testEmail,
			password: testPassword,
			options: {
				data: { user_type: 'parent' }
			}
		});

		const { data: signInData } = await supabase.auth.signInWithPassword({
			email: testEmail,
			password: testPassword
		});

		expect(signInData.session).toBeDefined();

		// Log out
		const { error } = await supabase.auth.signOut();
		expect(error).toBeNull();

		// Verify session is cleared
		const { data: sessionData } = await supabase.auth.getSession();
		expect(sessionData.session).toBeNull();
	});

	it('should handle logout when not authenticated', async () => {
		// Ensure no active session
		await supabase.auth.signOut();

		// Attempt logout (should not error)
		const { error } = await supabase.auth.signOut();
		expect(error).toBeNull();
	});
});

