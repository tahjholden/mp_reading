import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createClient } from '$lib/supabase/server';
import { getSessionUser, requireAuth } from '$lib/middleware/session';
import { saveOnboardingData } from '$lib/server/api/onboarding/save';
import { formatError } from '$lib/utils/errors';

export const POST: RequestHandler = async (event) => {
	try {
		const user = await requireAuth(event);
		
		// Both parents and children can complete onboarding (parent completes for child, or child completes themselves)
		const { child_id, reading_interest_survey, avatar_choices, initial_goals } =
			await event.request.json();

		if (!child_id || !reading_interest_survey || !avatar_choices) {
			return json({ error: 'Missing required fields' }, { status: 400 });
		}

		const supabase = createClient(event);

		// Verify user has access to this child
		if (user.type === 'parent') {
			// Check if parent is the primary parent of this child
			const { data: childData } = await supabase
				.from('children')
				.select('primary_parent_id')
				.eq('id', child_id)
				.single();

			if (!childData || childData.primary_parent_id !== user.id) {
				return json({ error: 'Access denied' }, { status: 403 });
			}
		} else if (user.type === 'child') {
			// Child can only complete their own onboarding
			if (user.id !== child_id) {
				return json({ error: 'Access denied' }, { status: 403 });
			}
		}

		// Save onboarding data
		const { data: onboardingData, error: onboardingError } = await saveOnboardingData(supabase, {
			child_id,
			reading_interest_survey,
			avatar_choices,
			initial_goals
		});

		if (onboardingError) {
			// Check if onboarding already exists (unique constraint)
			if (onboardingError instanceof Error && onboardingError.message.includes('duplicate')) {
				// Update existing onboarding instead
				const { data: updatedData, error: updateError } = await supabase
					.from('onboarding_data')
					.update({
						reading_interest_survey,
						avatar_choices,
						initial_goals
					})
					.eq('child_id', child_id)
					.select()
					.single();

				if (updateError) {
					return json({ error: 'Failed to save onboarding data' }, { status: 500 });
				}

				// Mark onboarding as completed
				await supabase
					.from('children')
					.update({ onboarding_completed: true })
					.eq('id', child_id);

				return json({ onboarding: updatedData, completed: true });
			}

			return json({ error: 'Failed to save onboarding data' }, { status: 500 });
		}

		// Mark onboarding as completed
		await supabase.from('children').update({ onboarding_completed: true }).eq('id', child_id);

		return json({ onboarding: onboardingData, completed: true });
	} catch (error) {
		const formattedError = formatError(error);
		return json(formattedError, { status: 500 });
	}
};

