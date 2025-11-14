/**
 * COPPA compliance utilities
 */

import type { Database } from '../supabase/types';

type Child = Database['public']['Tables']['children']['Row'];
type DataAccessLog = Database['public']['Tables']['data_access_logs']['Insert'];

/**
 * Log data access for COPPA compliance
 */
export async function logDataAccess(
	params: Omit<DataAccessLog, 'id' | 'timestamp'>
): Promise<void> {
	// This will be implemented to call the API endpoint that logs to data_access_logs table
	// For now, this is a placeholder
	console.log('Data access logged:', params);
}

/**
 * Check if user has access to child data (parent relationship)
 */
export function canAccessChild(
	userId: string,
	child: Child,
	secondaryParentIds: string[] = []
): boolean {
	// Primary parent can always access
	if (child.primary_parent_id === userId) {
		return true;
	}

	// Secondary parents can access if in list
	if (secondaryParentIds.includes(userId)) {
		return true;
	}

	return false;
}

/**
 * Validate parent consent (implicit in parent-as-admin model)
 */
export function hasParentConsent(child: Child): boolean {
	// In parent-as-admin model, parent consent is implicit through account creation
	// Parent created the child account = consent given
	return !!child.primary_parent_id;
}

/**
 * Format child data for export (COPPA requirement)
 */
export function formatChildDataExport(child: Child): Record<string, unknown> {
	return {
		child_id: child.id,
		name: child.name,
		age: child.age,
		grade_level: child.grade_level,
		reading_preferences: child.reading_preferences,
		avatar_data: child.avatar_data,
		reading_level: child.reading_level,
		created_at: child.created_at,
		updated_at: child.updated_at
	};
}

