/**
 * Integration test for child password reset flow
 * Tests that parents can reset child passwords (COPPA compliance)
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createClient } from '@supabase/supabase-js';
import { verifyPassword } from '$lib/utils/password';

const PUBLIC_SUPABASE_URL = process.env.PUBLIC_SUPABASE_URL || '';
const PUBLIC_SUPABASE_ANON_KEY = process.env.PUBLIC_SUPABASE_ANON_KEY || '';
const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:5173';

describe('Child Password Reset Flow Integration', () => {
	let supabase: ReturnType<typeof createClient>;
	let parentId: string;
	let parentToken: string;
	let childId: string;
	const childUsername = `testchild${Date.now()}`;
	const originalPassword = 'OriginalChildPassword123!';
	const newPassword = 'NewChildPassword123!';

	beforeAll(async () => {
		supabase = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, { db: { schema: 'mp_reading' } });

		// Create parent
		const parentEmail = `parent-reset-${Date.now()}@example.com`;
		const { data: signUpData } = await supabase.auth.signUp({
			email: parentEmail,
			password: 'ParentPassword123!'
		});

		if (signUpData.user) {
			parentId = signUpData.user.id;
			await supabase.from('parents').insert({
				id: parentId,
				email: parentEmail
			});

			// Sign in to get token
			const { data: signInData } = await supabase.auth.signInWithPassword({
				email: parentEmail,
				password: 'ParentPassword123!'
			});

			if (signInData.session) {
				parentToken = signInData.session.access_token;
			}

			// Create child with original password
			const { hashPassword } = await import('$lib/utils/password');
			const passwordHash = await hashPassword(originalPassword);

			const { data: childData } = await supabase
				.from('children')
				.insert({
					primary_parent_id: parentId,
					name: 'Test Child',
					age: 10,
					grade_level: 5,
					username: childUsername,
					password_hash: passwordHash
				})
				.select()
				.single();

			if (childData) {
				childId = childData.id;
			}
		}
	});

	it('should allow primary parent to reset child password', async () => {
		const response = await fetch(`${BASE_URL}/api/parents/children/${childId}/password`, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${parentToken}`
			},
			body: JSON.stringify({
				new_password: newPassword
			})
		});

		expect(response.status).toBe(200);
		const data = await response.json();
		expect(data).toHaveProperty('success', true);
	});

	it('should update child password hash in database', async () => {
		// Reset password
		await fetch(`/api/parents/children/${childId}/password`, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${parentToken}`
			},
			body: JSON.stringify({
				new_password: newPassword
			})
		});

		// Get child data
		const { data: childData } = await supabase
			.from('children')
			.select('password_hash')
			.eq('id', childId)
			.single();

		expect(childData).toBeDefined();
		expect(childData?.password_hash).toBeDefined();

		// Verify new password works
		const isValid = await verifyPassword(newPassword, childData!.password_hash);
		expect(isValid).toBe(true);
	});

	it('should allow child to login with new password', async () => {
		// Reset password first
		await fetch(`/api/parents/children/${childId}/password`, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${parentToken}`
			},
			body: JSON.stringify({
				new_password: newPassword
			})
		});

		// Try to login as child with new password
		const response = await fetch(`${BASE_URL}/api/auth/child/login`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				username: childUsername,
				password: newPassword
			})
		});

		expect(response.status).toBe(200);
		const data = await response.json();
		expect(data).toHaveProperty('session');
		expect(data).toHaveProperty('child');
	});

	it('should prevent child from logging in with old password', async () => {
		// Reset password first
		await fetch(`/api/parents/children/${childId}/password`, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${parentToken}`
			},
			body: JSON.stringify({
				new_password: newPassword
			})
		});

		// Try to login with old password (should fail)
		const response = await fetch(`${BASE_URL}/api/auth/child/login`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				username: childUsername,
				password: originalPassword
			})
		});

		expect(response.status).toBe(401);
	});

	it('should prevent secondary parent from resetting child password', async () => {
		// Create secondary parent
		const secondaryEmail = `secondary-${Date.now()}@example.com`;
		const { data: secondarySignUp } = await supabase.auth.signUp({
			email: secondaryEmail,
			password: 'SecondaryPassword123!'
		});

		if (secondarySignUp.user) {
			await supabase.from('parents').insert({
				id: secondarySignUp.user.id,
				email: secondaryEmail
			});

			// Create and accept invitation
			const { data: invitationData } = await supabase
				.from('parent_invitations')
				.insert({
					child_id: childId,
					invited_email: secondaryEmail,
					invited_by_parent_id: parentId,
					token: `token-${Date.now()}`,
					expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
					status: 'accepted',
					accepted_at: new Date().toISOString(),
					accepted_by_parent_id: secondarySignUp.user.id
				})
				.select()
				.single();

			// Sign in as secondary parent
			const { data: signInData } = await supabase.auth.signInWithPassword({
				email: secondaryEmail,
				password: 'SecondaryPassword123!'
			});

			if (signInData.session) {
				// Try to reset password (should fail)
				const response = await fetch(`${BASE_URL}/api/parents/children/${childId}/password`, {
					method: 'PUT',
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${signInData.session.access_token}`
					},
					body: JSON.stringify({
						new_password: 'HackedPassword123!'
					})
				});

				expect(response.status).toBe(403);
			}
		}
	});

	afterAll(async () => {
		if (childId) {
			await supabase.from('children').delete().eq('id', childId);
		}
		await supabase.auth.signOut();
	});
});

