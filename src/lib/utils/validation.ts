/**
 * Validation utilities for user input
 */

export interface ValidationResult {
	valid: boolean;
	error?: string;
}

/**
 * Validate email format
 */
export function validateEmail(email: string): ValidationResult {
	if (!email) {
		return { valid: false, error: 'Email is required' };
	}

	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	if (!emailRegex.test(email)) {
		return { valid: false, error: 'Invalid email format' };
	}

	return { valid: true };
}

/**
 * Validate username format (3-20 chars, alphanumeric and underscore only)
 */
export function validateUsername(username: string): ValidationResult {
	if (!username) {
		return { valid: false, error: 'Username is required' };
	}

	if (username.length < 3 || username.length > 20) {
		return { valid: false, error: 'Username must be between 3 and 20 characters' };
	}

	const usernameRegex = /^[a-zA-Z0-9_]+$/;
	if (!usernameRegex.test(username)) {
		return {
			valid: false,
			error: 'Username can only contain letters, numbers, and underscores'
		};
	}

	return { valid: true };
}

/**
 * Validate password strength
 */
export function validatePassword(password: string): ValidationResult {
	if (!password) {
		return { valid: false, error: 'Password is required' };
	}

	if (password.length < 8) {
		return { valid: false, error: 'Password must be at least 8 characters long' };
	}

	// Optional: Add complexity requirements
	// const hasUpperCase = /[A-Z]/.test(password);
	// const hasLowerCase = /[a-z]/.test(password);
	// const hasNumber = /[0-9]/.test(password);
	// if (!hasUpperCase || !hasLowerCase || !hasNumber) {
	//   return { valid: false, error: 'Password must contain uppercase, lowercase, and number' };
	// }

	return { valid: true };
}

/**
 * Validate age (9-12 for children)
 */
export function validateAge(age: number): ValidationResult {
	if (!age) {
		return { valid: false, error: 'Age is required' };
	}

	if (age < 9 || age > 12) {
		return { valid: false, error: 'Age must be between 9 and 12' };
	}

	return { valid: true };
}

/**
 * Validate grade level (4, 5, or 6)
 */
export function validateGradeLevel(grade: number): ValidationResult {
	if (!grade) {
		return { valid: false, error: 'Grade level is required' };
	}

	if (![4, 5, 6].includes(grade)) {
		return { valid: false, error: 'Grade level must be 4, 5, or 6' };
	}

	return { valid: true };
}

/**
 * Validate child name
 */
export function validateChildName(name: string): ValidationResult {
	if (!name || name.trim().length === 0) {
		return { valid: false, error: 'Name is required' };
	}

	if (name.trim().length < 2) {
		return { valid: false, error: 'Name must be at least 2 characters' };
	}

	return { valid: true };
}

/**
 * Check username uniqueness (async - requires database query)
 * This is a placeholder - actual uniqueness check is done in the API endpoint
 */
export async function checkUsernameUniqueness(
	username: string
): Promise<ValidationResult> {
	// This would make an API call to check uniqueness
	// For now, validation is done at the database level
	return { valid: true };
}

