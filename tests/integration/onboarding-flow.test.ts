/**
 * Integration test for child onboarding flow
 * Tests the complete onboarding process including survey and avatar creation
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
import { hashPassword } from '$lib/utils/password';

describe('Onboarding Flow Integration', () => {
	let supabase: ReturnType<typeof createClient>;
	let parentId: string;
	let childId: string;
	const testEmail = `onboarding-parent-${Date.now()}@example.com`;
	const testPassword = 'ParentPassword123!';
	const childUsername = `onboarding-child-${Date.now()}`;

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

		// Create parent profile
		await supabase.from('parents').insert({
			id: parentId,
			email: testEmail
		});

		// Create child profile
		const passwordHash = await hashPassword('ChildPassword123!');
		const { data: childData } = await supabase
			.from('children')
			.insert({
				primary_parent_id: parentId,
				username: childUsername,
				password_hash: passwordHash,
				name: 'Onboarding Test Child',
				age: 10,
				grade_level: 5
			})
			.select()
			.single();

		childId = childData?.id || '';
	});

	it('should create onboarding data for child', async () => {
		const surveyData = {
			genres: ['fantasy', 'adventure'],
			topics: ['magic', 'animals'],
			formats: ['books', 'audiobooks']
		};

		const avatarData = {
			hair: 'brown',
			eyes: 'blue',
			clothes: 'casual'
		};

		const { data: onboardingData, error } = await supabase
			.from('onboarding_data')
			.insert({
				child_id: childId,
				reading_interest_survey: surveyData,
				avatar_choices: avatarData,
				initial_goals: { daily_reading_minutes: 20 }
			})
			.select()
			.single();

		expect(error).toBeNull();
		expect(onboardingData).toBeDefined();
		expect(onboardingData.child_id).toBe(childId);
		expect(onboardingData.reading_interest_survey).toEqual(surveyData);
		expect(onboardingData.avatar_choices).toEqual(avatarData);
	});

	it('should mark child onboarding as completed', async () => {
		// Update child onboarding_completed flag
		const { data: updatedChild, error } = await supabase
			.from('children')
			.update({ onboarding_completed: true })
			.eq('id', childId)
			.select()
			.single();

		expect(error).toBeNull();
		expect(updatedChild.onboarding_completed).toBe(true);
	});

	it('should enforce one onboarding per child', async () => {
		const { error } = await supabase.from('onboarding_data').insert({
			child_id: childId, // Duplicate child_id
			reading_interest_survey: {},
			avatar_choices: {}
		});

		expect(error).toBeDefined();
		expect(error?.code).toBe('23505'); // PostgreSQL unique violation
	});

	afterAll(async () => {
		// Cleanup
		await supabase.from('onboarding_data').delete().eq('child_id', childId);
		await supabase.from('children').delete().eq('id', childId);
		await supabase.auth.signOut();
	});
});

