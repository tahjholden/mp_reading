/**
 * Send password reset email to parent
 * Uses Supabase Auth's built-in password reset functionality
 */

import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Send password reset email
 * @param supabase - Supabase client
 * @param email - Parent's email address
 */
export async function sendPasswordResetEmail(
	supabase: SupabaseClient,
	email: string
): Promise<{ error: unknown }> {
	try {
		// Use Supabase Auth's built-in password reset
		// This sends an email with a reset link
		const { error } = await supabase.auth.resetPasswordForEmail(email, {
			redirectTo: `${process.env.PUBLIC_APP_URL || 'http://localhost:5173'}/reset-password`
		});

		if (error) {
			return { error };
		}

		// In production, you might want to log this event
		console.log(`Password reset email sent to: ${email}`);

		return { error: null };
	} catch (error) {
		return { error };
	}
}

