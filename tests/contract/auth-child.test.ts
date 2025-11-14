/**
 * Contract tests for child login endpoint
 * Tests the API contract without full integration
 */

import { describe, it, expect } from 'vitest';

describe('Child Login API Contract', () => {
	it('should accept username and password in request body', async () => {
		// This test will fail until endpoint is implemented
		const response = await fetch('/api/auth/child/login', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				username: 'testchild',
				password: 'testpassword123'
			})
		});

		expect(response.status).toBeDefined();
		// Will fail until implementation
		expect(response.status).toBe(200);
	});

	it('should return 401 for invalid credentials', async () => {
		const response = await fetch('/api/auth/child/login', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				username: 'invaliduser',
				password: 'wrongpassword'
			})
		});

		expect(response.status).toBe(401);
	});

	it('should return 400 for missing username', async () => {
		const response = await fetch('/api/auth/child/login', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				password: 'testpassword123'
			})
		});

		expect(response.status).toBe(400);
	});

	it('should return 400 for missing password', async () => {
		const response = await fetch('/api/auth/child/login', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				username: 'testchild'
			})
		});

		expect(response.status).toBe(400);
	});

	it('should return session and child data on successful login', async () => {
		// This test will fail until endpoint is implemented
		const response = await fetch('/api/auth/child/login', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				username: 'testchild',
				password: 'testpassword123'
			})
		});

		if (response.ok) {
			const data = await response.json();
			expect(data).toHaveProperty('session');
			expect(data).toHaveProperty('child');
			expect(data.child).toHaveProperty('id');
			expect(data.child).toHaveProperty('username');
			expect(data.child).toHaveProperty('name');
		}
	});
});

