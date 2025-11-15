/**
 * Save onboarding data for a child
 */

import type { Database } from '$lib/supabase/types';
import type { SupabaseClient } from '@supabase/supabase-js';

type OnboardingInsert = Database['public']['Tables']['onboarding_data']['Insert'];

export interface OnboardingInput {
	child_id: string;
	reading_interest_survey: Record<string, unknown>;
	avatar_choices: Record<string, unknown>;
	initial_goals?: Record<string, unknown>;
}

export async function saveOnboardingData(
	supabase: SupabaseClient<Database>,
	input: OnboardingInput
): Promise<{ data: Database['public']['Tables']['onboarding_data']['Row'] | null; error: unknown }> {
	try {
		const onboardingData: OnboardingInsert = {
			child_id: input.child_id,
			reading_interest_survey: input.reading_interest_survey,
			avatar_choices: input.avatar_choices,
			initial_goals: input.initial_goals || null
		};

		const { data, error } = await supabase
			.from('onboarding_data')
			.insert(onboardingData)
			.select()
			.single();

		if (error) {
			return { data: null, error };
		}

		return { data, error: null };
	} catch (error) {
		return { data: null, error };
	}
}

