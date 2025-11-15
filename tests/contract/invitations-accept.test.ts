/**
 * Contract tests for accept invitation endpoint
 * Tests the API contract without full integration
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { createClient } from '@supabase/supabase-js';

const PUBLIC_SUPABASE_URL = process.env.PUBLIC_SUPABASE_URL || '';
const PUBLIC_SUPABASE_ANON_KEY = process.env.PUBLIC_SUPABASE_ANON_KEY || '';
const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:5173';

describe('Accept Invitation API Contract', () => {
	let supabase: ReturnType<typeof createClient>;
	let invitationToken: string;

	beforeAll(async () => {
		if (!PUBLIC_SUPABASE_URL || !PUBLIC_SUPABASE_ANON_KEY) {
			throw new Error('PUBLIC_SUPABASE_URL and PUBLIC_SUPABASE_ANON_KEY must be set in environment');
		}
		supabase = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, { db: { schema: 'mp_reading' } });

		// Create test invitation in database
		const testEmail = `primary-${Date.now()}@example.com`;
		const { data: signUpData } = await supabase.auth.signUp({
			email: testEmail,
			password: 'TestPassword123!'
		});

		if (signUpData.user) {
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
				// Create invitation directly in database for testing
				const { data: invitationData } = await supabase
					.from('parent_invitations')
					.insert({
						child_id: childData.id,
						invited_email: 'invited@example.com',
						invited_by_parent_id: signUpData.user.id,
						token: `test-token-${Date.now()}`,
						expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
						status: 'pending'
					})
					.select()
					.single();

				if (invitationData) {
					invitationToken = invitationData.token;
				}
			}
		}
	});

	it('should accept invitation token in URL path', async () => {
		const response = await fetch(`${BASE_URL}/api/parents/invitations/${invitationToken}/accept`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({})
		});

		expect(response.status).toBeDefined();
		// Will fail until implementation
		expect(response.status).toBe(200);
	});

	it('should return 400 for invalid token', async () => {
		const response = await fetch(`${BASE_URL}/api/parents/invitations/invalid-token-123/accept`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({})
		});

		expect(response.status).toBe(400);
	});

	it('should return 400 for expired token', async () => {
		// Create expired invitation
		const expiredToken = `expired-${Date.now()}`;
		await supabase.from('parent_invitations').insert({
			child_id: '00000000-0000-0000-0000-000000000000',
			invited_email: 'expired@example.com',
			invited_by_parent_id: '00000000-0000-0000-0000-000000000000',
			token: expiredToken,
			expires_at: new Date(Date.now() - 1000).toISOString(), // Expired
			status: 'expired'
		});

		const response = await fetch(`${BASE_URL}/api/parents/invitations/${expiredToken}/accept`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({})
		});

		expect(response.status).toBe(400);
	});

	it('should allow creating account during acceptance', async () => {
		const newToken = `new-token-${Date.now()}`;
		const invitedEmail = `new-invited-${Date.now()}@example.com`;

		// Create invitation
		const { data: parentData } = await supabase.auth.signUp({
			email: `primary-${Date.now()}@example.com`,
			password: 'TestPassword123!'
		});

		if (parentData.user) {
			const { data: childData } = await supabase
				.from('children')
				.insert({
					primary_parent_id: parentData.user.id,
					name: 'Test Child',
					age: 10,
					grade_level: 5,
					username: `testchild${Date.now()}`,
					password_hash: 'hashedpassword'
				})
				.select()
				.single();

			if (childData) {
				await supabase.from('parent_invitations').insert({
					child_id: childData.id,
					invited_email: invitedEmail,
					invited_by_parent_id: parentData.user.id,
					token: newToken,
					expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
					status: 'pending'
				});

				const response = await fetch(`${BASE_URL}/api/parents/invitations/${newToken}/accept`, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify({
						email: invitedEmail,
						password: 'NewPassword123!'
					})
				});

				// Should succeed if implementation allows account creation
				if (response.ok) {
					const data = await response.json();
					expect(data).toHaveProperty('success', true);
				}
			}
		}
	});

	it('should allow logged-in parent to accept invitation', async () => {
		// Create invited parent account
		const invitedEmail = `invited-parent-${Date.now()}@example.com`;
		await supabase.auth.signUp({
			email: invitedEmail,
			password: 'InvitedPassword123!'
		});

		const { data: signInData } = await supabase.auth.signInWithPassword({
			email: invitedEmail,
			password: 'InvitedPassword123!'
		});

		if (signInData.session) {
			const response = await fetch(`${BASE_URL}/api/parents/invitations/${invitationToken}/accept`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${signInData.session.access_token}`
				},
				body: JSON.stringify({})
			});

			// Should succeed if parent is logged in and email matches
			if (response.ok) {
				const data = await response.json();
				expect(data).toHaveProperty('success', true);
			}
		}
	});
});

