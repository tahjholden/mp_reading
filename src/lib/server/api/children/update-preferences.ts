/**
 * Update child reading preferences
 */

import type { Database } from '$lib/supabase/types';
import type { SupabaseClient } from '@supabase/supabase-js';

export async function updateChildPreferences(
	supabase: SupabaseClient<Database>,
	childId: string,
	readingPreferences: Record<string, unknown>
): Promise<{ data: Database['public']['Tables']['children']['Row'] | null; error: unknown }> {
	try {
		const { data, error } = await supabase
			.from('children')
			.update({ reading_preferences: readingPreferences })
			.eq('id', childId)
			.select()
			.single();

		if (error) {
			return { data: null, error };
		}

		// Log preference update (for COPPA compliance)
		// This would be logged to data_access_logs in production

		return { data, error: null };
	} catch (error) {
		return { data: null, error };
	}
}

