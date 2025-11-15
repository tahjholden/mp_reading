/**
 * Contract tests for send invitation endpoint
 * Tests the API contract without full integration
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { createClient } from '@supabase/supabase-js';

const PUBLIC_SUPABASE_URL = process.env.PUBLIC_SUPABASE_URL || '';
const PUBLIC_SUPABASE_ANON_KEY = process.env.PUBLIC_SUPABASE_ANON_KEY || '';
const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:5173';

describe('Send Invitation API Contract', () => {
	let supabase: ReturnType<typeof createClient>;
	let parentToken: string;
	let childId: string;

	beforeAll(async () => {
		if (!PUBLIC_SUPABASE_URL || !PUBLIC_SUPABASE_ANON_KEY) {
			throw new Error('PUBLIC_SUPABASE_URL and PUBLIC_SUPABASE_ANON_KEY must be set in environment');
		}
		supabase = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, { db: { schema: 'mp_reading' } });

		// Create test parent and child for testing
		const testEmail = `invite-test-${Date.now()}@example.com`;
		const testPassword = 'TestPassword123!';

		const { data: signUpData } = await supabase.auth.signUp({
			email: testEmail,
			password: testPassword
		});

		if (signUpData.user) {
			const { data: signInData } = await supabase.auth.signInWithPassword({
				email: testEmail,
				password: testPassword
			});

			if (signInData.session) {
				parentToken = signInData.session.access_token;

				// Create a test child
				const { data: childData } = await supabase
					.from('children')
					.insert({
						primary_parent_id: signInData.user.id,
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
		}
	});

	it('should accept child_id and invited_email in request body', async () => {
		const response = await fetch(`${BASE_URL}/api/parents/invitations`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${parentToken}`
			},
			body: JSON.stringify({
				child_id: childId,
				invited_email: 'secondary@example.com'
			})
		});

		expect(response.status).toBeDefined();
		// Will fail until implementation
		expect(response.status).toBe(201);
	});

	it('should return 400 for missing child_id', async () => {
		const response = await fetch(`${BASE_URL}/api/parents/invitations`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${parentToken}`
			},
			body: JSON.stringify({
				invited_email: 'secondary@example.com'
			})
		});

		expect(response.status).toBe(400);
	});

	it('should return 400 for missing invited_email', async () => {
		const response = await fetch(`${BASE_URL}/api/parents/invitations`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${parentToken}`
			},
			body: JSON.stringify({
				child_id: childId
			})
		});

		expect(response.status).toBe(400);
	});

	it('should return 400 for invalid email format', async () => {
		const response = await fetch(`${BASE_URL}/api/parents/invitations`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${parentToken}`
			},
			body: JSON.stringify({
				child_id: childId,
				invited_email: 'invalid-email'
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
			const response = await fetch(`${BASE_URL}/api/parents/invitations`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${signInData.session.access_token}`
				},
				body: JSON.stringify({
					child_id: childId,
					invited_email: 'secondary@example.com'
				})
			});

			expect(response.status).toBe(403);
		}
	});

	it('should return invitation data on successful creation', async () => {
		const response = await fetch(`${BASE_URL}/api/parents/invitations`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${parentToken}`
			},
			body: JSON.stringify({
				child_id: childId,
				invited_email: 'secondary@example.com'
			})
		});

		if (response.ok) {
			const data = await response.json();
			expect(data).toHaveProperty('id');
			expect(data).toHaveProperty('token');
			expect(data).toHaveProperty('status', 'pending');
			expect(data).toHaveProperty('expires_at');
			expect(data).toHaveProperty('invited_email', 'secondary@example.com');
		}
	});
});

