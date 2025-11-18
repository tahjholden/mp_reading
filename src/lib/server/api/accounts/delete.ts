/**
 * Account deletion with data cleanup
 * Handles deletion of parent accounts and associated child data
 * For COPPA compliance, child data can be anonymized or deleted per parent request
 */

import type { SupabaseClient } from '@supabase/supabase-js';

export interface DeleteAccountOptions {
	anonymizeChildren?: boolean; // If true, anonymize child data instead of deleting
	deleteChildren?: boolean; // If true, delete child data completely
}

/**
 * Delete parent account and handle child data according to options
 */
export async function deleteParentAccount(
	supabase: SupabaseClient,
	parentId: string,
	options: DeleteAccountOptions = {}
): Promise<{ success: boolean; error?: string }> {
	try {
		// Get all children for this parent
		const { data: children, error: childrenError } = await supabase
			.from('children')
			.select('id')
			.eq('primary_parent_id', parentId);

		if (childrenError) {
			return { success: false, error: 'Failed to fetch children' };
		}

		const childIds = children?.map((c) => c.id) || [];

		// Handle child data based on options
		if (options.deleteChildren) {
			// Delete all child-related data
			for (const childId of childIds) {
				// Delete onboarding data
				await supabase.from('onboarding_data').delete().eq('child_id', childId);

				// Delete data access logs
				await supabase.from('data_access_logs').delete().eq('child_id', childId);

				// Delete parent invitations
				await supabase.from('parent_invitations').delete().eq('child_id', childId);

				// Delete child profile
				await supabase.from('children').delete().eq('id', childId);
			}
		} else if (options.anonymizeChildren) {
			// Anonymize child data instead of deleting
			for (const childId of childIds) {
				await supabase
					.from('children')
					.update({
						name: '[Deleted]',
						username: `deleted_${Date.now()}_${Math.random().toString(36).substring(7)}`,
						email: null,
						reading_preferences: null,
						avatar_data: null
					})
					.eq('id', childId);
			}
		}

		// Delete parent invitations where this parent was invited
		await supabase.from('parent_invitations').delete().eq('invited_parent_id', parentId);

		// Delete parent profile
		const { error: deleteError } = await supabase.from('parents').delete().eq('id', parentId);

		if (deleteError) {
			return { success: false, error: 'Failed to delete parent account' };
		}

		// Note: Supabase Auth user deletion should be handled separately
		// This requires admin privileges or calling Supabase Auth API directly

		return { success: true };
	} catch (error) {
		console.error('Error deleting account:', error);
		return { success: false, error: 'An unexpected error occurred' };
	}
}

/**
 * Delete child account (parent-initiated)
 */
export async function deleteChildAccount(
	supabase: SupabaseClient,
	childId: string,
	parentId: string
): Promise<{ success: boolean; error?: string }> {
	try {
		// Verify parent has access
		const { data: child, error: childError } = await supabase
			.from('children')
			.select('primary_parent_id')
			.eq('id', childId)
			.eq('primary_parent_id', parentId)
			.single();

		if (childError || !child) {
			return { success: false, error: 'Child not found or access denied' };
		}

		// Delete all child-related data
		await supabase.from('onboarding_data').delete().eq('child_id', childId);
		await supabase.from('data_access_logs').delete().eq('child_id', childId);
		await supabase.from('parent_invitations').delete().eq('child_id', childId);
		await supabase.from('children').delete().eq('id', childId);

		return { success: true };
	} catch (error) {
		console.error('Error deleting child account:', error);
		return { success: false, error: 'An unexpected error occurred' };
	}
}



