/**
 * Integration test for secondary parent read-only access
 * Tests that secondary parents can read but not modify child data
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createClient } from '@supabase/supabase-js';

const PUBLIC_SUPABASE_URL = process.env.PUBLIC_SUPABASE_URL || '';
const PUBLIC_SUPABASE_ANON_KEY = process.env.PUBLIC_SUPABASE_ANON_KEY || '';
const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:5173';

describe('Secondary Parent Read-Only Access Integration', () => {
	let supabase: ReturnType<typeof createClient>;
	let primaryParentId: string;
	let secondaryParentId: string;
	let childId: string;
	let invitationId: string;
	const primaryEmail = `primary-${Date.now()}@example.com`;
	const secondaryEmail = `secondary-${Date.now()}@example.com`;

	beforeAll(async () => {
		supabase = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, { db: { schema: 'mp_reading' } });

		// Create primary parent
		const { data: primarySignUp } = await supabase.auth.signUp({
			email: primaryEmail,
			password: 'PrimaryPassword123!'
		});

		if (primarySignUp.user) {
			primaryParentId = primarySignUp.user.id;
			await supabase.from('parents').insert({
				id: primaryParentId,
				email: primaryEmail
			});
		}

		// Create secondary parent
		const { data: secondarySignUp } = await supabase.auth.signUp({
			email: secondaryEmail,
			password: 'SecondaryPassword123!'
		});

		if (secondarySignUp.user) {
			secondaryParentId = secondarySignUp.user.id;
			await supabase.from('parents').insert({
				id: secondaryParentId,
				email: secondaryEmail
			});
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
				password_hash: 'hashedpassword',
				reading_preferences: { genres: ['adventure'] },
				avatar_data: { color: 'blue' }
			})
			.select()
			.single();

		if (childData) {
			childId = childData.id;
		}

		// Create and accept invitation
		const { data: invitationData } = await supabase
			.from('parent_invitations')
			.insert({
				child_id: childId,
				invited_email: secondaryEmail,
				invited_by_parent_id: primaryParentId,
				token: `token-${Date.now()}`,
				expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
				status: 'accepted',
				accepted_at: new Date().toISOString(),
				accepted_by_parent_id: secondaryParentId
			})
			.select()
			.single();

		if (invitationData) {
			invitationId = invitationData.id;
		}
	});

	it('should allow secondary parent to read child profile', async () => {
		// Sign in as secondary parent
		const { data: signInData } = await supabase.auth.signInWithPassword({
			email: secondaryEmail,
			password: 'SecondaryPassword123!'
		});

		expect(signInData.session).toBeDefined();

		// Read child data
		const { data: childData, error } = await supabase
			.from('children')
			.select('*')
			.eq('id', childId)
			.single();

		expect(error).toBeNull();
		expect(childData).toBeDefined();
		expect(childData?.id).toBe(childId);
		expect(childData?.name).toBe('Test Child');
	});

	it('should prevent secondary parent from updating child profile', async () => {
		// Sign in as secondary parent
		const { data: signInData } = await supabase.auth.signInWithPassword({
			email: secondaryEmail,
			password: 'SecondaryPassword123!'
		});

		expect(signInData.session).toBeDefined();

		// Try to update child name
		const { error } = await supabase
			.from('children')
			.update({ name: 'Modified Name' })
			.eq('id', childId);

		// Should be blocked by RLS
		expect(error).toBeDefined();
		expect(error?.code).toBe('42501'); // Insufficient privilege
	});

	it('should prevent secondary parent from updating child preferences', async () => {
		// Sign in as secondary parent
		const { data: signInData } = await supabase.auth.signInWithPassword({
			email: secondaryEmail,
			password: 'SecondaryPassword123!'
		});

		expect(signInData.session).toBeDefined();

		// Try to update preferences via API
		const response = await fetch(`${BASE_URL}/api/children/${childId}/preferences`, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${signInData.session!.access_token}`
			},
			body: JSON.stringify({
				reading_preferences: { genres: ['mystery'] }
			})
		});

		// Should be blocked (403 or 401)
		expect([403, 401]).toContain(response.status);
	});

	it('should prevent secondary parent from updating child avatar', async () => {
		// Sign in as secondary parent
		const { data: signInData } = await supabase.auth.signInWithPassword({
			email: secondaryEmail,
			password: 'SecondaryPassword123!'
		});

		expect(signInData.session).toBeDefined();

		// Try to update avatar via API
		const response = await fetch(`${BASE_URL}/api/children/${childId}/avatar`, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${signInData.session!.access_token}`
			},
			body: JSON.stringify({
				avatar_data: { color: 'red' }
			})
		});

		// Should be blocked (403 or 401)
		expect([403, 401]).toContain(response.status);
	});

	it('should prevent secondary parent from resetting child password', async () => {
		// Sign in as secondary parent
		const { data: signInData } = await supabase.auth.signInWithPassword({
			email: secondaryEmail,
			password: 'SecondaryPassword123!'
		});

		expect(signInData.session).toBeDefined();

		// Try to reset password via API
		const response = await fetch(`${BASE_URL}/api/parents/children/${childId}/password`, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${signInData.session!.access_token}`
			},
			body: JSON.stringify({
				new_password: 'NewPassword123!'
			})
		});

		// Should be blocked (403)
		expect(response.status).toBe(403);
	});

	it('should allow primary parent to modify child data', async () => {
		// Sign in as primary parent
		const { data: signInData } = await supabase.auth.signInWithPassword({
			email: primaryEmail,
			password: 'PrimaryPassword123!'
		});

		expect(signInData.session).toBeDefined();

		// Update child name
		const { error } = await supabase
			.from('children')
			.update({ name: 'Updated Name' })
			.eq('id', childId);

		// Should succeed
		expect(error).toBeNull();
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

