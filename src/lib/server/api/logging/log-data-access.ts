/**
 * Comprehensive logging for all data access events
 * Logs to data_access_logs table for COPPA compliance
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '$lib/supabase/types';

type DataAccessLog = Database['public']['Tables']['data_access_logs']['Insert'];

/**
 * Log data access event
 */
export async function logDataAccess(
	supabase: SupabaseClient,
	params: {
		userId: string | null;
		childId: string;
		action: 'read' | 'create' | 'update' | 'delete';
		tableName: string;
		recordId?: string | null;
		ipAddress?: string | null;
		userAgent?: string | null;
	}
): Promise<void> {
	try {
		const logEntry: DataAccessLog = {
			user_id: params.userId,
			child_id: params.childId,
			action: params.action,
			table_name: params.tableName,
			record_id: params.recordId || null,
			ip_address: params.ipAddress || null,
			user_agent: params.userAgent || null
		};

		const { error } = await supabase.from('data_access_logs').insert(logEntry);

		if (error) {
			console.error('Failed to log data access:', error);
			// Don't throw - logging failures shouldn't break the application
		}
	} catch (error) {
		console.error('Error logging data access:', error);
		// Don't throw - logging failures shouldn't break the application
	}
}

/**
 * Extract IP address from request
 */
export function getIpAddress(request: Request): string | null {
	// Check various headers for IP address
	const forwarded = request.headers.get('x-forwarded-for');
	if (forwarded) {
		return forwarded.split(',')[0].trim();
	}

	const realIp = request.headers.get('x-real-ip');
	if (realIp) {
		return realIp;
	}

	return null;
}

/**
 * Extract user agent from request
 */
export function getUserAgent(request: Request): string | null {
	return request.headers.get('user-agent') || null;
}



