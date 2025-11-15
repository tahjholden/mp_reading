/**
 * Update child avatar data
 */

import type { Database } from '$lib/supabase/types';
import type { SupabaseClient } from '@supabase/supabase-js';

export async function updateChildAvatar(
	supabase: SupabaseClient<Database>,
	childId: string,
	avatarData: Record<string, unknown>
): Promise<{ data: Database['public']['Tables']['children']['Row'] | null; error: unknown }> {
	try {
		const { data, error } = await supabase
			.from('children')
			.update({ avatar_data: avatarData })
			.eq('id', childId)
			.select()
			.single();

		if (error) {
			return { data: null, error };
		}

		// Log avatar update (for COPPA compliance)
		// This would be logged to data_access_logs in production

		return { data, error: null };
	} catch (error) {
		return { data: null, error };
	}
}

