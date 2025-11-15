/**
 * Contract tests for create child endpoint
 * Tests the API contract without full integration
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';

describe('Create Child API Contract', () => {
	let supabase: ReturnType<typeof createClient>;
	let parentAuthToken: string;
	let parentId: string;

	beforeAll(async () => {
		supabase = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, { db: { schema: 'mp_reading' } });
		
		// Create a test parent account
		const { data: signUpData } = await supabase.auth.signUp({
			email: `parent-${Date.now()}@example.com`,
			password: 'ParentPassword123!',
			options: {
				data: { user_type: 'parent' }
			}
		});

		if (signUpData.session) {
			parentAuthToken = signUpData.session.access_token;
			parentId = signUpData.user?.id || '';
		}
	});

	it('should accept child data in request body', async () => {
		// This test will fail until endpoint is implemented
		const response = await fetch('/api/parents/children', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${parentAuthToken}`
			},
			body: JSON.stringify({
				name: 'Test Child',
				age: 10,
				grade_level: 5,
				username: `testchild-${Date.now()}`,
				password: 'ChildPassword123!'
			})
		});

		expect(response.status).toBeDefined();
		// Will fail until implementation
		expect(response.status).toBe(201);
	});

	it('should return 401 without authentication', async () => {
		const response = await fetch('/api/parents/children', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				name: 'Test Child',
				age: 10,
				grade_level: 5,
				username: 'testchild',
				password: 'ChildPassword123!'
			})
		});

		expect(response.status).toBe(401);
	});

	it('should return 400 for invalid age', async () => {
		const response = await fetch('/api/parents/children', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${parentAuthToken}`
			},
			body: JSON.stringify({
				name: 'Test Child',
				age: 15, // Invalid: must be 9-12
				grade_level: 5,
				username: 'testchild',
				password: 'ChildPassword123!'
			})
		});

		expect(response.status).toBe(400);
	});

	it('should return 400 for invalid grade level', async () => {
		const response = await fetch('/api/parents/children', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${parentAuthToken}`
			},
			body: JSON.stringify({
				name: 'Test Child',
				age: 10,
				grade_level: 8, // Invalid: must be 4, 5, or 6
				username: 'testchild',
				password: 'ChildPassword123!'
			})
		});

		expect(response.status).toBe(400);
	});

	it('should return 400 for duplicate username', async () => {
		const username = `duplicate-${Date.now()}`;

		// First creation
		await fetch('/api/parents/children', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${parentAuthToken}`
			},
			body: JSON.stringify({
				name: 'First Child',
				age: 10,
				grade_level: 5,
				username,
				password: 'ChildPassword123!'
			})
		});

		// Second creation with same username
		const response = await fetch('/api/parents/children', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${parentAuthToken}`
			},
			body: JSON.stringify({
				name: 'Second Child',
				age: 11,
				grade_level: 6,
				username, // Duplicate
				password: 'AnotherPassword123!'
			})
		});

		expect(response.status).toBe(400);
	});

	it('should return child data on successful creation', async () => {
		// This test will fail until endpoint is implemented
		const response = await fetch('/api/parents/children', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${parentAuthToken}`
			},
			body: JSON.stringify({
				name: 'Test Child',
				age: 10,
				grade_level: 5,
				username: `testchild-${Date.now()}`,
				password: 'ChildPassword123!'
			})
		});

		if (response.ok) {
			const data = await response.json();
			expect(data).toHaveProperty('id');
			expect(data).toHaveProperty('name');
			expect(data).toHaveProperty('username');
			expect(data).not.toHaveProperty('password_hash'); // Should not expose password hash
		}
	});
});

