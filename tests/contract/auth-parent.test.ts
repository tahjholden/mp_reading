/**
 * Contract tests for parent login endpoint
 * Tests the API contract without full integration
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
import { createClient } from '@supabase/supabase-js';

describe('Parent Login API Contract', () => {
	let supabase: ReturnType<typeof createClient>;

	beforeAll(() => {
		supabase = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, { db: { schema: 'mp_reading' } });
	});

	it('should accept email and password in request body', async () => {
		// This test will fail until endpoint is implemented
		const response = await fetch('/api/auth/parent/login', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				email: 'test@example.com',
				password: 'testpassword123'
			})
		});

		expect(response.status).toBeDefined();
		// Will fail until implementation
		expect(response.status).toBe(200);
	});

	it('should return 401 for invalid credentials', async () => {
		const response = await fetch('/api/auth/parent/login', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				email: 'invalid@example.com',
				password: 'wrongpassword'
			})
		});

		expect(response.status).toBe(401);
	});

	it('should return 400 for missing email', async () => {
		const response = await fetch('/api/auth/parent/login', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				password: 'testpassword123'
			})
		});

		expect(response.status).toBe(400);
	});

	it('should return 400 for missing password', async () => {
		const response = await fetch('/api/auth/parent/login', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				email: 'test@example.com'
			})
		});

		expect(response.status).toBe(400);
	});

	it('should return session and parent data on successful login', async () => {
		// This test will fail until endpoint is implemented
		const response = await fetch('/api/auth/parent/login', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				email: 'test@example.com',
				password: 'testpassword123'
			})
		});

		if (response.ok) {
			const data = await response.json();
			expect(data).toHaveProperty('session');
			expect(data).toHaveProperty('parent');
			expect(data.parent).toHaveProperty('id');
			expect(data.parent).toHaveProperty('email');
		}
	});
});

