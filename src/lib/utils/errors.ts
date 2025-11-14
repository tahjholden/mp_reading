/**
 * Error handling utilities
 */

export class AppError extends Error {
	constructor(
		message: string,
		public code: string,
		public statusCode: number = 500
	) {
		super(message);
		this.name = 'AppError';
	}
}

export class ValidationError extends AppError {
	constructor(message: string) {
		super(message, 'VALIDATION_ERROR', 400);
		this.name = 'ValidationError';
	}
}

export class AuthenticationError extends AppError {
	constructor(message: string = 'Authentication failed') {
		super(message, 'AUTHENTICATION_ERROR', 401);
		this.name = 'AuthenticationError';
	}
}

export class AuthorizationError extends AppError {
	constructor(message: string = 'Access denied') {
		super(message, 'AUTHORIZATION_ERROR', 403);
		this.name = 'AuthorizationError';
	}
}

export class NotFoundError extends AppError {
	constructor(message: string = 'Resource not found') {
		super(message, 'NOT_FOUND', 404);
		this.name = 'NotFoundError';
	}
}

/**
 * Format error for API response
 */
export function formatError(error: unknown): { error: string; code?: string } {
	if (error instanceof AppError) {
		return {
			error: error.message,
			code: error.code
		};
	}

	if (error instanceof Error) {
		return {
			error: error.message
		};
	}

	return {
		error: 'An unexpected error occurred'
	};
}

/**
 * Log error with context
 */
export function logError(error: unknown, context?: Record<string, unknown>): void {
	const errorInfo = {
		message: error instanceof Error ? error.message : 'Unknown error',
		stack: error instanceof Error ? error.stack : undefined,
		context
	};

	console.error('Error:', errorInfo);
	// In production, send to error tracking service (e.g., Sentry)
}

