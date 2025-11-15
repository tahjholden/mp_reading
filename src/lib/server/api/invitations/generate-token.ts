/**
 * Generate secure invitation token
 * Uses crypto.randomBytes for cryptographically secure tokens
 */

import { randomBytes } from 'crypto';

/**
 * Generate a secure invitation token
 * @returns A URL-safe base64 encoded token (32 bytes = 44 characters)
 */
export function generateInvitationToken(): string {
	// Generate 32 random bytes (256 bits)
	const tokenBytes = randomBytes(32);
	// Convert to base64url (URL-safe base64)
	return tokenBytes.toString('base64url');
}

