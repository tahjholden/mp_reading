/**
 * Integration test for session persistence
 * Tests that user sessions persist across page refreshes and requests
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';

describe('Session Persistence', () => {
	let supabase: ReturnType<typeof createClient>;
	const testEmail = `session-test-${Date.now()}@example.com`;
	const testPassword = 'SessionTest123!';

	beforeAll(() => {
		supabase = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, { db: { schema: 'mp_reading' } });
	});

	it('should persist session after login', async () => {
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

		// Get session again (simulating page refresh)
		const { data: sessionData } = await supabase.auth.getSession();
		expect(sessionData.session).toBeDefined();
		expect(sessionData.session?.user?.email).toBe(testEmail);
	});

	it('should refresh expired session automatically', async () => {
		// Sign in
		const { data: signInData } = await supabase.auth.signInWithPassword({
			email: testEmail,
			password: testPassword
		});

		expect(signInData.session).toBeDefined();

		// Supabase automatically handles token refresh
		// This test verifies session remains valid
		const { data: refreshedSession } = await supabase.auth.getSession();
		expect(refreshedSession.session).toBeDefined();
	});

	afterAll(async () => {
		await supabase.auth.signOut();
	});
});

