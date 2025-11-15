/**
 * Create parent profile in database after Supabase Auth signup
 */

import type { Database } from '$lib/supabase/types';
import type { SupabaseClient } from '@supabase/supabase-js';

type ParentInsert = Database['public']['Tables']['parents']['Insert'];

export async function createParentProfile(
	supabase: SupabaseClient<Database>,
	parentData: ParentInsert
): Promise<{ data: Database['public']['Tables']['parents']['Row'] | null; error: unknown }> {
	try {
		const { data, error } = await supabase.from('parents').insert(parentData).select().single();

		if (error) {
			return { data: null, error };
		}

		return { data, error: null };
	} catch (error) {
		return { data: null, error };
	}
}

