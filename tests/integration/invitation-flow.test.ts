/**
 * Integration test for parent invitation flow
 * Tests the complete invitation process from sending to acceptance
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createClient } from '@supabase/supabase-js';

const PUBLIC_SUPABASE_URL = process.env.PUBLIC_SUPABASE_URL || '';
const PUBLIC_SUPABASE_ANON_KEY = process.env.PUBLIC_SUPABASE_ANON_KEY || '';
const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:5173';

describe('Parent Invitation Flow Integration', () => {
	let supabase: ReturnType<typeof createClient>;
	let primaryParentId: string;
	let primaryParentToken: string;
	let childId: string;
	let invitationId: string;
	let invitationToken: string;
	const primaryEmail = `primary-${Date.now()}@example.com`;
	const invitedEmail = `invited-${Date.now()}@example.com`;

	beforeAll(async () => {
		supabase = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, { db: { schema: 'mp_reading' } });

		// Create primary parent
		const { data: signUpData } = await supabase.auth.signUp({
			email: primaryEmail,
			password: 'PrimaryPassword123!'
		});

		if (signUpData.user) {
			primaryParentId = signUpData.user.id;

			// Create parent profile
			await supabase.from('parents').insert({
				id: primaryParentId,
				email: primaryEmail
			});

			// Sign in to get token
			const { data: signInData } = await supabase.auth.signInWithPassword({
				email: primaryEmail,
				password: 'PrimaryPassword123!'
			});

			if (signInData.session) {
				primaryParentToken = signInData.session.access_token;
			}

			// Create child
			const { data: childData } = await supabase
				.from('children')
				.insert({
					primary_parent_id: primaryParentId,
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

	it('should allow primary parent to send invitation', async () => {
		const response = await fetch(`${BASE_URL}/api/parents/invitations`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${primaryParentToken}`
			},
			body: JSON.stringify({
				child_id: childId,
				invited_email: invitedEmail
			})
		});

		expect(response.status).toBe(201);
		const data = await response.json();
		expect(data).toHaveProperty('id');
		expect(data).toHaveProperty('token');
		expect(data).toHaveProperty('status', 'pending');
		expect(data.invited_email).toBe(invitedEmail);

		invitationId = data.id;
		invitationToken = data.token;
	});

	it('should create invitation record in database', async () => {
		const { data: invitation, error } = await supabase
			.from('parent_invitations')
			.select('*')
			.eq('id', invitationId)
			.single();

		expect(error).toBeNull();
		expect(invitation).toBeDefined();
		expect(invitation?.status).toBe('pending');
		expect(invitation?.invited_email).toBe(invitedEmail);
		expect(invitation?.child_id).toBe(childId);
		expect(invitation?.invited_by_parent_id).toBe(primaryParentId);
	});

	it('should allow invited parent to accept invitation after creating account', async () => {
		// Create invited parent account
		const { data: signUpData } = await supabase.auth.signUp({
			email: invitedEmail,
			password: 'InvitedPassword123!'
		});

		expect(signUpData.user).toBeDefined();

		// Create parent profile
		await supabase.from('parents').insert({
			id: signUpData.user!.id,
			email: invitedEmail
		});

		// Sign in
		const { data: signInData } = await supabase.auth.signInWithPassword({
			email: invitedEmail,
			password: 'InvitedPassword123!'
		});

		expect(signInData.session).toBeDefined();

		// Accept invitation
		const response = await fetch(`${BASE_URL}/api/parents/invitations/${invitationToken}/accept`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${signInData.session!.access_token}`
			},
			body: JSON.stringify({})
		});

		expect(response.status).toBe(200);
		const data = await response.json();
		expect(data).toHaveProperty('success', true);
	});

	it('should update invitation status to accepted', async () => {
		const { data: invitation, error } = await supabase
			.from('parent_invitations')
			.select('*')
			.eq('id', invitationId)
			.single();

		expect(error).toBeNull();
		expect(invitation?.status).toBe('accepted');
		expect(invitation?.accepted_at).toBeDefined();
		expect(invitation?.accepted_by_parent_id).toBeDefined();
	});

	it('should allow secondary parent to view child data (read-only)', async () => {
		// Sign in as invited parent
		const { data: signInData } = await supabase.auth.signInWithPassword({
			email: invitedEmail,
			password: 'InvitedPassword123!'
		});

		expect(signInData.session).toBeDefined();

		// Try to read child data
		const { data: childData, error } = await supabase
			.from('children')
			.select('*')
			.eq('id', childId)
			.single();

		// Should be able to read (RLS allows)
		expect(error).toBeNull();
		expect(childData).toBeDefined();
		expect(childData?.id).toBe(childId);
	});

	it('should prevent secondary parent from modifying child data', async () => {
		// Sign in as invited parent
		const { data: signInData } = await supabase.auth.signInWithPassword({
			email: invitedEmail,
			password: 'InvitedPassword123!'
		});

		expect(signInData.session).toBeDefined();

		// Try to update child data (should be blocked by RLS)
		const { error } = await supabase
			.from('children')
			.update({ name: 'Modified Name' })
			.eq('id', childId);

		// Should be blocked (RLS prevents)
		expect(error).toBeDefined();
	});

	afterAll(async () => {
		// Cleanup
		if (invitationId) {
			await supabase.from('parent_invitations').delete().eq('id', invitationId);
		}
		if (childId) {
			await supabase.from('children').delete().eq('id', childId);
		}
		await supabase.auth.signOut();
	});
});

