/**
 * Contract tests for child password reset endpoint
 * Tests the API contract without full integration
 * Note: Child password reset is parent-initiated only (COPPA compliance)
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { createClient } from '@supabase/supabase-js';

const PUBLIC_SUPABASE_URL = process.env.PUBLIC_SUPABASE_URL || '';
const PUBLIC_SUPABASE_ANON_KEY = process.env.PUBLIC_SUPABASE_ANON_KEY || '';
const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:5173';

describe('Child Password Reset API Contract', () => {
	let supabase: ReturnType<typeof createClient>;
	let parentToken: string;
	let childId: string;

	beforeAll(async () => {
		supabase = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, { db: { schema: 'mp_reading' } });

		// Create test parent and child
		const testEmail = `child-reset-test-${Date.now()}@example.com`;
		const { data: signUpData } = await supabase.auth.signUp({
			email: testEmail,
			password: 'ParentPassword123!'
		});

		if (signUpData.user) {
			// Create parent profile
			await supabase.from('parents').insert({
				id: signUpData.user.id,
				email: testEmail
			});

			// Sign in to get token
			const { data: signInData } = await supabase.auth.signInWithPassword({
				email: testEmail,
				password: 'ParentPassword123!'
			});

			if (signInData.session) {
				parentToken = signInData.session.access_token;
			}

			// Create child
			const { data: childData } = await supabase
				.from('children')
				.insert({
					primary_parent_id: signUpData.user.id,
					name: 'Test Child',
					age: 10,
					grade_level: 5,
					username: `testchild${Date.now()}`,
					password_hash: 'hashedpassword'
				})
				.select()
				.single();

			if (childData) {
				childId = childData.id;
			}
		}
	});

	it('should accept new_password in request body', async () => {
		const response = await fetch(`${BASE_URL}/api/parents/children/${childId}/password`, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${parentToken}`
			},
			body: JSON.stringify({
				new_password: 'NewChildPassword123!'
			})
		});

		expect(response.status).toBeDefined();
		// Should succeed (endpoint already exists)
		expect([200, 204]).toContain(response.status);
	});

	it('should return 400 for missing new_password', async () => {
		const response = await fetch(`${BASE_URL}/api/parents/children/${childId}/password`, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${parentToken}`
			},
			body: JSON.stringify({})
		});

		expect(response.status).toBe(400);
	});

	it('should return 400 for invalid password (too short)', async () => {
		const response = await fetch(`${BASE_URL}/api/parents/children/${childId}/password`, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${parentToken}`
			},
			body: JSON.stringify({
				new_password: 'short'
			})
		});

		expect(response.status).toBe(400);
	});

	it('should return 403 for non-primary parent', async () => {
		// Create another parent
		const otherEmail = `other-parent-${Date.now()}@example.com`;
		await supabase.auth.signUp({
			email: otherEmail,
			password: 'OtherPassword123!'
		});

		const { data: signInData } = await supabase.auth.signInWithPassword({
			email: otherEmail,
			password: 'OtherPassword123!'
		});

		if (signInData.session) {
			const response = await fetch(`${BASE_URL}/api/parents/children/${childId}/password`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${signInData.session.access_token}`
				},
				body: JSON.stringify({
					new_password: 'NewPassword123!'
				})
			});

			expect(response.status).toBe(403);
		}
	});

	it('should return 401 for unauthenticated request', async () => {
		const response = await fetch(`${BASE_URL}/api/parents/children/${childId}/password`, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				new_password: 'NewPassword123!'
			})
		});

		expect(response.status).toBe(401);
	});

	it('should return 404 for non-existent child', async () => {
		const fakeChildId = '00000000-0000-0000-0000-000000000000';
		const response = await fetch(`${BASE_URL}/api/parents/children/${fakeChildId}/password`, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${parentToken}`
			},
			body: JSON.stringify({
				new_password: 'NewPassword123!'
			})
		});

		expect(response.status).toBe(404);
	});
});

