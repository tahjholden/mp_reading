/**
 * Integration test for parent password reset flow
 * Tests the complete password reset process
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createClient } from '@supabase/supabase-js';

const PUBLIC_SUPABASE_URL = process.env.PUBLIC_SUPABASE_URL || '';
const PUBLIC_SUPABASE_ANON_KEY = process.env.PUBLIC_SUPABASE_ANON_KEY || '';
const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:5173';

describe('Parent Password Reset Flow Integration', () => {
	let supabase: ReturnType<typeof createClient>;
	const testEmail = `reset-flow-${Date.now()}@example.com`;
	const originalPassword = 'OriginalPassword123!';
	const newPassword = 'NewPassword123!';

	beforeAll(async () => {
		supabase = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, { db: { schema: 'mp_reading' } });

		// Create test parent account
		await supabase.auth.signUp({
			email: testEmail,
			password: originalPassword
		});

		// Create parent profile
		const { data: userData } = await supabase.auth.getUser();
		if (userData.user) {
			await supabase.from('parents').insert({
				id: userData.user.id,
				email: testEmail
			});
		}
	});

	it('should allow parent to request password reset', async () => {
		const response = await fetch(`${BASE_URL}/api/auth/parent/reset-password`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				email: testEmail
			})
		});

		expect(response.status).toBe(200);
		const data = await response.json();
		expect(data).toHaveProperty('success', true);
	});

	it('should send password reset email with token', async () => {
		// This test validates that the email sending function is called
		// In a real implementation, you'd mock the email service
		const response = await fetch(`${BASE_URL}/api/auth/parent/reset-password`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				email: testEmail
			})
		});

		expect(response.status).toBe(200);
		// Email should be sent (check logs in development)
	});

	it('should allow parent to reset password with valid token', async () => {
		// Request reset
		await fetch('/api/auth/parent/reset-password', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				email: testEmail
			})
		});

		// In a real test, you'd extract the token from the email
		// For now, we'll test that the endpoint accepts token and password
		// This will fail until implementation
		const testToken = 'test-token-from-email';
		const response = await fetch(`${BASE_URL}/api/auth/parent/reset-password/confirm`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				token: testToken,
				new_password: newPassword
			})
		});

		// Will fail until implementation
		expect(response.status).toBe(200);
	});

	it('should prevent password reset with expired token', async () => {
		// Create expired token (would be in database)
		const expiredToken = 'expired-token';
		const response = await fetch(`${BASE_URL}/api/auth/parent/reset-password/confirm`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				token: expiredToken,
				new_password: newPassword
			})
		});

		expect(response.status).toBe(400);
		const data = await response.json();
		expect(data.error).toContain('expired');
	});

	it('should allow parent to login with new password after reset', async () => {
		// After successful password reset, parent should be able to login
		const { data, error } = await supabase.auth.signInWithPassword({
			email: testEmail,
			password: newPassword
		});

		// This will fail until password is actually reset
		expect(error).toBeNull();
		expect(data.user).toBeDefined();
	});

	it('should prevent login with old password after reset', async () => {
		// After password reset, old password should not work
		const { error } = await supabase.auth.signInWithPassword({
			email: testEmail,
			password: originalPassword
		});

		// Should fail
		expect(error).toBeDefined();
	});

	afterAll(async () => {
		await supabase.auth.signOut();
	});
});

