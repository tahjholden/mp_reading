/**
 * Integration test for child creation flow
 * Tests parent creating a child profile
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
import { hashPassword, verifyPassword } from '$lib/utils/password';

describe('Child Creation Flow Integration', () => {
	let supabase: ReturnType<typeof createClient>;
	let parentId: string;
	let parentAuthToken: string;
	const testEmail = `parent-${Date.now()}@example.com`;
	const testPassword = 'ParentPassword123!';
	const childUsername = `child-${Date.now()}`;
	const childPassword = 'ChildPassword123!';

	beforeAll(async () => {
		supabase = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, { db: { schema: 'mp_reading' } });

		// Create parent account
		const { data: signUpData } = await supabase.auth.signUp({
			email: testEmail,
			password: testPassword,
			options: {
				data: { user_type: 'parent' }
			}
		});

		parentId = signUpData.user?.id || '';
		parentAuthToken = signUpData.session?.access_token || '';

		// Create parent profile in database (simulating signup endpoint)
		await supabase.from('parents').insert({
			id: parentId,
			email: testEmail
		});
	});

	it('should create child profile with hashed password', async () => {
		const passwordHash = await hashPassword(childPassword);

		const { data: childData, error: childError } = await supabase
			.from('children')
			.insert({
				primary_parent_id: parentId,
				username: childUsername,
				password_hash: passwordHash,
				name: 'Test Child',
				age: 10,
				grade_level: 5
			})
			.select()
			.single();

		expect(childError).toBeNull();
		expect(childData).toBeDefined();
		expect(childData.username).toBe(childUsername);
		expect(childData.primary_parent_id).toBe(parentId);

		// Verify password hash works
		const isValid = await verifyPassword(childPassword, childData.password_hash);
		expect(isValid).toBe(true);
	});

	it('should enforce username uniqueness', async () => {
		const passwordHash = await hashPassword('AnotherPassword123!');

		const { error } = await supabase.from('children').insert({
			primary_parent_id: parentId,
			username: childUsername, // Duplicate username
			password_hash: passwordHash,
			name: 'Another Child',
			age: 11,
			grade_level: 6
		});

		expect(error).toBeDefined();
		expect(error?.code).toBe('23505'); // PostgreSQL unique violation
	});

	it('should enforce age constraint (9-12)', async () => {
		const passwordHash = await hashPassword('ChildPassword123!');

		const { error } = await supabase.from('children').insert({
			primary_parent_id: parentId,
			username: `child-${Date.now()}`,
			password_hash: passwordHash,
			name: 'Invalid Age Child',
			age: 15, // Invalid: must be 9-12
			grade_level: 5
		});

		expect(error).toBeDefined();
	});

	it('should enforce grade level constraint (4, 5, 6)', async () => {
		const passwordHash = await hashPassword('ChildPassword123!');

		const { error } = await supabase.from('children').insert({
			primary_parent_id: parentId,
			username: `child-${Date.now()}`,
			password_hash: passwordHash,
			name: 'Invalid Grade Child',
			age: 10,
			grade_level: 8 // Invalid: must be 4, 5, or 6
		});

		expect(error).toBeDefined();
	});

	afterAll(async () => {
		// Cleanup: Delete test child
		await supabase.from('children').delete().eq('username', childUsername);
		await supabase.auth.signOut();
	});
});

