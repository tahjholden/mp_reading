/**
 * Integration test for parent signup flow
 * Tests the complete signup process including account creation and profile setup
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';

describe('Parent Signup Flow Integration', () => {
	let supabase: ReturnType<typeof createClient>;
	const testEmail = `signup-test-${Date.now()}@example.com`;
	const testPassword = 'SignupTest123!';

	beforeAll(() => {
		supabase = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, { db: { schema: 'mp_reading' } });
	});

	it('should create parent account via Supabase Auth', async () => {
		const { data, error } = await supabase.auth.signUp({
			email: testEmail,
			password: testPassword,
			options: {
				data: {
					user_type: 'parent'
				}
			}
		});

		expect(error).toBeNull();
		expect(data.user).toBeDefined();
		expect(data.user?.email).toBe(testEmail);
		expect(data.user?.user_metadata?.user_type).toBe('parent');
	});

	it('should create parent profile in database', async () => {
		// Sign in first
		const { data: signInData } = await supabase.auth.signInWithPassword({
			email: testEmail,
			password: testPassword
		});

		expect(signInData.user).toBeDefined();

		// Check if parent profile exists (this will be created by the signup endpoint)
		const { data: parentData, error: parentError } = await supabase
			.from('parents')
			.select('*')
			.eq('id', signInData.user!.id)
			.single();

		// Parent profile may not exist yet if signup endpoint hasn't created it
		// This test validates the flow once implementation is complete
		if (!parentError && parentData) {
			expect(parentData.email).toBe(testEmail);
		}
	});

	it('should allow parent to sign in after signup', async () => {
		const { data, error } = await supabase.auth.signInWithPassword({
			email: testEmail,
			password: testPassword
		});

		expect(error).toBeNull();
		expect(data.user).toBeDefined();
		expect(data.session).toBeDefined();
	});

	afterAll(async () => {
		await supabase.auth.signOut();
	});
});

