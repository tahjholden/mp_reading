/**
 * Export child data for COPPA compliance
 * Parents can request a complete export of their child's data
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '$lib/supabase/types';

type ChildDataExport = {
	child_profile: Database['public']['Tables']['children']['Row'] | null;
	onboarding_data: Database['public']['Tables']['onboarding_data']['Row'] | null;
	data_access_logs: Database['public']['Tables']['data_access_logs']['Row'][];
	export_metadata: {
		exported_at: string;
		exported_by: string;
		child_id: string;
	};
};

/**
 * Export all data for a child (COPPA compliance)
 */
export async function exportChildData(
	supabase: SupabaseClient,
	childId: string,
	parentId: string
): Promise<ChildDataExport> {
	// Note: Access verification should be done in the API endpoint before calling this function

	// Get onboarding data
	const { data: onboardingData } = await supabase
		.from('onboarding_data')
		.select('*')
		.eq('child_id', childId)
		.single();

	// Get data access logs
	const { data: accessLogs } = await supabase
		.from('data_access_logs')
		.select('*')
		.eq('child_id', childId)
		.order('timestamp', { ascending: false });

	return {
		child_profile: child,
		onboarding_data: onboardingData || null,
		data_access_logs: accessLogs || [],
		export_metadata: {
			exported_at: new Date().toISOString(),
			exported_by: parentId,
			child_id: childId
		}
	};
}

