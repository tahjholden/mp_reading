/**
 * Integration test for child login and dashboard access
 * Tests that children can log in and access their personalized dashboard
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
import { hashPassword } from '$lib/utils/password';

describe('Child Dashboard Flow Integration', () => {
	let supabase: ReturnType<typeof createClient>;
	let parentId: string;
	let childId: string;
	let childUsername: string;
	let childPassword: string;
	const testEmail = `dashboard-parent-${Date.now()}@example.com`;
	const testPassword = 'ParentPassword123!';

	beforeAll(async () => {
		supabase = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY);

		// Create parent account
		const { data: signUpData } = await supabase.auth.signUp({
			email: testEmail,
			password: testPassword,
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
		childUsername = `dashboard-child-${Date.now()}`;
		childPassword = 'ChildPassword123!';
		const passwordHash = await hashPassword(childPassword);
		const { data: childData } = await supabase
			.from('children')
			.insert({
				primary_parent_id: parentId,
				username: childUsername,
				password_hash: passwordHash,
				name: 'Dashboard Test Child',
				age: 10,
				grade_level: 5,
				onboarding_completed: true
			})
			.select()
			.single();

		childId = childData?.id || '';
	});

	it('should allow child to log in with username and password', async () => {
		const response = await fetch('/api/auth/child/login', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				username: childUsername,
				password: childPassword
			})
		});

		expect(response.status).toBe(200);
		const data = await response.json();
		expect(data).toHaveProperty('session');
		expect(data).toHaveProperty('child');
		expect(data.child.id).toBe(childId);
	});

	it('should allow child to access their dashboard', async () => {
		// Login first
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

		// Access dashboard/child profile
		const response = await fetch(`/api/children/${childId}`, {
			headers: {
				Authorization: `Bearer ${sessionToken}`
			}
		});

		expect(response.status).toBe(200);
		const data = await response.json();
		expect(data.id).toBe(childId);
		expect(data.name).toBe('Dashboard Test Child');
	});

	it('should prevent child from accessing other children\'s profiles', async () => {
		// Create another child
		const anotherPasswordHash = await hashPassword('AnotherPassword123!');
		const { data: anotherChild } = await supabase
			.from('children')
			.insert({
				primary_parent_id: parentId,
				username: `another-child-${Date.now()}`,
				password_hash: anotherPasswordHash,
				name: 'Another Child',
				age: 11,
				grade_level: 6
			})
			.select()
			.single();

		// Login as first child
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

		// Try to access another child's profile
		const response = await fetch(`/api/children/${anotherChild?.id}`, {
			headers: {
				Authorization: `Bearer ${sessionToken}`
			}
		});

		// Should be denied (403 or 404)
		expect([403, 404]).toContain(response.status);
	});

	afterAll(async () => {
		// Cleanup
		await supabase.from('children').delete().eq('id', childId);
		await supabase.auth.signOut();
	});
});

