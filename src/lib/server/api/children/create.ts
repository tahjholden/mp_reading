/**
 * Create child profile
 */

import type { Database } from '$lib/supabase/types';
import type { SupabaseClient } from '@supabase/supabase-js';
import { hashPassword } from '$lib/utils/password';
import { validateUsername, validateAge, validateGradeLevel, validateChildName } from '$lib/utils/validation';
import { ValidationError } from '$lib/utils/errors';

type ChildInsert = Database['public']['Tables']['children']['Insert'];

export interface CreateChildInput {
	name: string;
	age: number;
	grade_level: number;
	username: string;
	password: string;
	email?: string;
	primary_parent_id: string;
}

export async function createChildProfile(
	supabase: SupabaseClient<Database>,
	input: CreateChildInput
): Promise<{ data: Database['public']['Tables']['children']['Row'] | null; error: unknown }> {
	try {
		// Validate input
		const nameValidation = validateChildName(input.name);
		if (!nameValidation.valid) {
			throw new ValidationError(nameValidation.error || 'Invalid name');
		}

		const ageValidation = validateAge(input.age);
		if (!ageValidation.valid) {
			throw new ValidationError(ageValidation.error || 'Invalid age');
		}

		const gradeValidation = validateGradeLevel(input.grade_level);
		if (!gradeValidation.valid) {
			throw new ValidationError(gradeValidation.error || 'Invalid grade level');
		}

		const usernameValidation = validateUsername(input.username);
		if (!usernameValidation.valid) {
			throw new ValidationError(usernameValidation.error || 'Invalid username');
		}

		// Check username uniqueness
		const { data: existingChild } = await supabase
			.from('children')
			.select('id')
			.eq('username', input.username)
			.single();

		if (existingChild) {
			throw new ValidationError('Username already taken');
		}

		// Hash password
		const passwordHash = await hashPassword(input.password);

		// Create child profile
		const childData: ChildInsert = {
			primary_parent_id: input.primary_parent_id,
			username: input.username,
			password_hash: passwordHash,
			name: input.name,
			age: input.age,
			grade_level: input.grade_level,
			email: input.email || null,
			onboarding_completed: false
		};

		const { data, error } = await supabase.from('children').insert(childData).select().single();

		if (error) {
			return { data: null, error };
		}

		// Log child creation event (for COPPA compliance)
		// This would be logged to data_access_logs in production

		return { data, error: null };
	} catch (error) {
		return { data: null, error };
	}
}

