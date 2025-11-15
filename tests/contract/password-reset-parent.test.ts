/**
 * Contract tests for parent password reset endpoint
 * Tests the API contract without full integration
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { createClient } from '@supabase/supabase-js';

const PUBLIC_SUPABASE_URL = process.env.PUBLIC_SUPABASE_URL || '';
const PUBLIC_SUPABASE_ANON_KEY = process.env.PUBLIC_SUPABASE_ANON_KEY || '';
const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:5173';

describe('Parent Password Reset API Contract', () => {
	let supabase: ReturnType<typeof createClient>;
	let testEmail: string;

	beforeAll(async () => {
		supabase = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, { db: { schema: 'mp_reading' } });

		// Create test parent account
		testEmail = `reset-test-${Date.now()}@example.com`;
		await supabase.auth.signUp({
			email: testEmail,
			password: 'OriginalPassword123!'
		});
	});

	it('should accept email in request body for password reset request', async () => {
		const response = await fetch(`${BASE_URL}/api/auth/parent/reset-password`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				email: testEmail
			})
		});

		expect(response.status).toBeDefined();
		// Will fail until implementation
		expect(response.status).toBe(200);
	});

	it('should return 400 for missing email', async () => {
		const response = await fetch(`${BASE_URL}/api/auth/parent/reset-password`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({})
		});

		expect(response.status).toBe(400);
	});

	it('should return 400 for invalid email format', async () => {
		const response = await fetch(`${BASE_URL}/api/auth/parent/reset-password`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				email: 'invalid-email'
			})
		});

		expect(response.status).toBe(400);
	});

	it('should return success message even for non-existent email (security)', async () => {
		const response = await fetch(`${BASE_URL}/api/auth/parent/reset-password`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				email: 'nonexistent@example.com'
			})
		});

		// Should return 200 to prevent email enumeration
		expect(response.status).toBe(200);
	});

	it('should accept token and new password for password reset confirmation', async () => {
		const response = await fetch(`${BASE_URL}/api/auth/parent/reset-password/confirm`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				token: 'test-token',
				new_password: 'NewPassword123!'
			})
		});

		expect(response.status).toBeDefined();
		// Will fail until implementation
		expect(response.status).toBe(200);
	});

	it('should return 400 for missing token', async () => {
		const response = await fetch(`${BASE_URL}/api/auth/parent/reset-password/confirm`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				new_password: 'NewPassword123!'
			})
		});

		expect(response.status).toBe(400);
	});

	it('should return 400 for missing new password', async () => {
		const response = await fetch(`${BASE_URL}/api/auth/parent/reset-password/confirm`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				token: 'test-token'
			})
		});

		expect(response.status).toBe(400);
	});

	it('should return 400 for invalid password (too short)', async () => {
		const response = await fetch(`${BASE_URL}/api/auth/parent/reset-password/confirm`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				token: 'test-token',
				new_password: 'short'
			})
		});

		expect(response.status).toBe(400);
	});

	it('should return 400 for expired or invalid token', async () => {
		const response = await fetch(`${BASE_URL}/api/auth/parent/reset-password/confirm`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				token: 'invalid-expired-token',
				new_password: 'NewPassword123!'
			})
		});

		expect(response.status).toBe(400);
	});
});

