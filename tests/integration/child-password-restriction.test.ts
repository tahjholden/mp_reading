/**
 * Integration test for child password change restrictions
 * Tests that children cannot self-initiate password resets (COPPA compliance)
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
import { hashPassword } from '$lib/utils/password';

describe('Child Password Restriction Integration', () => {
	let supabase: ReturnType<typeof createClient>;
	let parentId: string;
	let childId: string;
	let childUsername: string;
	let childPassword: string;
	const testEmail = `password-parent-${Date.now()}@example.com`;

	beforeAll(async () => {
		supabase = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY);

		// Create parent account
		const { data: signUpData } = await supabase.auth.signUp({
			email: testEmail,
			password: 'ParentPassword123!',
			options: {
				data: { user_type: 'parent' }
			}
		});

		parentId = signUpData.user?.id || '';

		// Create parent profile
		await supabase.from('parents').insert({
			id: parentId,
			email: testEmail
		});

		// Create child profile
		childUsername = `password-child-${Date.now()}`;
		childPassword = 'ChildPassword123!';
		const passwordHash = await hashPassword(childPassword);
		const { data: childData } = await supabase
			.from('children')
			.insert({
				primary_parent_id: parentId,
				username: childUsername,
				password_hash: passwordHash,
				name: 'Password Test Child',
				age: 10,
				grade_level: 5,
				onboarding_completed: true
			})
			.select()
			.single();

		childId = childData?.id || '';
	});

	it('should prevent child from accessing password reset endpoint', async () => {
		// Login as child
		const loginResponse = await fetch('/api/auth/child/login', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				username: childUsername,
				password: childPassword
			})
		});

		const loginData = await loginResponse.json();
		const sessionToken = loginData.session?.token;

		// Try to reset password (should be blocked)
		const response = await fetch(`/api/parents/children/${childId}/password`, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${sessionToken}`
			},
			body: JSON.stringify({
				new_password: 'NewPassword123!'
			})
		});

		// Should be denied (403 or 401)
		expect([403, 401]).toContain(response.status);
	});

	it('should allow parent to reset child password', async () => {
		// Login as parent
		await supabase.auth.signInWithPassword({
			email: testEmail,
			password: 'ParentPassword123!'
		});

		const {
			data: { session }
		} = await supabase.auth.getSession();
		const parentToken = session?.access_token;

		// Parent should be able to reset child password
		const response = await fetch(`/api/parents/children/${childId}/password`, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${parentToken}`
			},
			body: JSON.stringify({
				new_password: 'NewChildPassword123!'
			})
		});

		// Should succeed (200 or 204)
		expect([200, 204]).toContain(response.status);
	});

	afterAll(async () => {
		// Cleanup
		await supabase.from('children').delete().eq('id', childId);
		await supabase.auth.signOut();
	});
});

