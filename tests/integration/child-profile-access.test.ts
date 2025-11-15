/**
 * Integration test for child profile access
 * Tests that children can view and update their own profile
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
import { hashPassword } from '$lib/utils/password';

describe('Child Profile Access Integration', () => {
	let supabase: ReturnType<typeof createClient>;
	let parentId: string;
	let childId: string;
	let childUsername: string;
	let childPassword: string;
	const testEmail = `profile-parent-${Date.now()}@example.com`;

	beforeAll(async () => {
		supabase = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, { db: { schema: 'mp_reading' } });

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
		childUsername = `profile-child-${Date.now()}`;
		childPassword = 'ChildPassword123!';
		const passwordHash = await hashPassword(childPassword);
		const { data: childData } = await supabase
			.from('children')
			.insert({
				primary_parent_id: parentId,
				username: childUsername,
				password_hash: passwordHash,
				name: 'Profile Test Child',
				age: 10,
				grade_level: 5,
				onboarding_completed: true
			})
			.select()
			.single();

		childId = childData?.id || '';
	});

	it('should allow child to view their own profile', async () => {
		// Login
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

		// Get profile
		const response = await fetch(`/api/children/${childId}`, {
			headers: {
				Authorization: `Bearer ${sessionToken}`
			}
		});

		expect(response.status).toBe(200);
		const data = await response.json();
		expect(data.id).toBe(childId);
		expect(data.name).toBe('Profile Test Child');
	});

	it('should allow child to update their reading preferences', async () => {
		// Login
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

		const newPreferences = {
			genres: ['fantasy', 'adventure'],
			topics: ['magic', 'animals']
		};

		// Update preferences
		const response = await fetch(`/api/children/${childId}/preferences`, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${sessionToken}`
			},
			body: JSON.stringify({
				reading_preferences: newPreferences
			})
		});

		expect(response.status).toBe(200);
		const data = await response.json();
		expect(data.reading_preferences).toEqual(newPreferences);
	});

	it('should allow child to update their avatar', async () => {
		// Login
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

		const newAvatar = {
			hair: 'blonde',
			eyes: 'green',
			clothes: 'sporty'
		};

		// Update avatar
		const response = await fetch(`/api/children/${childId}/avatar`, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${sessionToken}`
			},
			body: JSON.stringify({
				avatar_data: newAvatar
			})
		});

		expect(response.status).toBe(200);
		const data = await response.json();
		expect(data.avatar_data).toEqual(newAvatar);
	});

	afterAll(async () => {
		// Cleanup
		await supabase.from('children').delete().eq('id', childId);
		await supabase.auth.signOut();
	});
});

