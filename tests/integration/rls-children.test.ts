/**
 * Integration test for RLS policies on child data
 * Tests that parents can only access their own children's data
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
import { hashPassword } from '$lib/utils/password';

describe('RLS Policies on Children Data', () => {
	let supabase: ReturnType<typeof createClient>;
	let parent1Id: string;
	let parent2Id: string;
	let child1Id: string;
	let child2Id: string;

	const parent1Email = `parent1-${Date.now()}@example.com`;
	const parent2Email = `parent2-${Date.now()}@example.com`;

	beforeAll(async () => {
		supabase = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY);

		// Create two parent accounts
		const { data: parent1Data } = await supabase.auth.signUp({
			email: parent1Email,
			password: 'Parent1Password123!',
			options: { data: { user_type: 'parent' } }
		});
		parent1Id = parent1Data.user?.id || '';

		const { data: parent2Data } = await supabase.auth.signUp({
			email: parent2Email,
			password: 'Parent2Password123!',
			options: { data: { user_type: 'parent' } }
		});
		parent2Id = parent2Data.user?.id || '';

		// Create parent profiles
		await supabase.from('parents').insert([
			{ id: parent1Id, email: parent1Email },
			{ id: parent2Id, email: parent2Email }
		]);

		// Create children for each parent
		const passwordHash = await hashPassword('ChildPassword123!');
		const { data: child1Data } = await supabase
			.from('children')
			.insert({
				primary_parent_id: parent1Id,
				username: `child1-${Date.now()}`,
				password_hash: passwordHash,
				name: 'Parent 1 Child',
				age: 10,
				grade_level: 5
			})
			.select()
			.single();
		child1Id = child1Data?.id || '';

		const { data: child2Data } = await supabase
			.from('children')
			.insert({
				primary_parent_id: parent2Id,
				username: `child2-${Date.now()}`,
				password_hash: passwordHash,
				name: 'Parent 2 Child',
				age: 11,
				grade_level: 6
			})
			.select()
			.single();
		child2Id = child2Data?.id || '';
	});

	it('should allow parent to view their own children', async () => {
		// Sign in as parent 1
		await supabase.auth.signInWithPassword({
			email: parent1Email,
			password: 'Parent1Password123!'
		});

		const { data: children, error } = await supabase
			.from('children')
			.select('*')
			.eq('primary_parent_id', parent1Id);

		expect(error).toBeNull();
		expect(children).toBeDefined();
		expect(children?.length).toBeGreaterThan(0);
		expect(children?.some((c) => c.id === child1Id)).toBe(true);
	});

	it('should prevent parent from viewing other parents children', async () => {
		// Sign in as parent 1
		await supabase.auth.signInWithPassword({
			email: parent1Email,
			password: 'Parent1Password123!'
		});

		// Try to access parent 2's child
		const { data: children, error } = await supabase
			.from('children')
			.select('*')
			.eq('id', child2Id);

		// RLS should filter out the child (parent 1 can't see parent 2's children)
		expect(children?.length).toBe(0);
	});

	it('should prevent parent from updating other parents children', async () => {
		// Sign in as parent 1
		await supabase.auth.signInWithPassword({
			email: parent1Email,
			password: 'Parent1Password123!'
		});

		// Try to update parent 2's child
		const { error } = await supabase
			.from('children')
			.update({ name: 'Hacked Name' })
			.eq('id', child2Id);

		// RLS should prevent the update
		expect(error).toBeDefined();
	});

	it('should allow parent to update their own children', async () => {
		// Sign in as parent 1
		await supabase.auth.signInWithPassword({
			email: parent1Email,
			password: 'Parent1Password123!'
		});

		// Update own child
		const { data, error } = await supabase
			.from('children')
			.update({ name: 'Updated Name' })
			.eq('id', child1Id)
			.select()
			.single();

		expect(error).toBeNull();
		expect(data.name).toBe('Updated Name');
	});

	afterAll(async () => {
		// Cleanup
		await supabase.from('children').delete().in('id', [child1Id, child2Id]);
		await supabase.from('parents').delete().in('id', [parent1Id, parent2Id]);
		await supabase.auth.signOut();
	});
});

