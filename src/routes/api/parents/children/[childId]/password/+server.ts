import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createClient } from '$lib/supabase/server';
import { requireAuth } from '$lib/middleware/session';
import { hashPassword } from '$lib/utils/password';
import { validatePassword } from '$lib/utils/validation';
import { formatError, AuthorizationError, NotFoundError, ValidationError } from '$lib/utils/errors';

export const PUT: RequestHandler = async (event) => {
	try {
		const user = await requireAuth(event);
		const { childId } = event.params;
		const { new_password } = await event.request.json();

		// Only parents can reset child passwords (COPPA compliance)
		if (user.type !== 'parent') {
			throw new AuthorizationError('Only parents can reset child passwords');
		}

		// Validate password
		const passwordValidation = validatePassword(new_password);
		if (!passwordValidation.valid) {
			throw new ValidationError(passwordValidation.error || 'Invalid password');
		}

		const supabase = createClient(event);

		// Verify child exists and parent has access
		const { data: childData, error: childError } = await supabase
			.from('children')
			.select('*')
			.eq('id', childId)
			.single();

		if (childError || !childData) {
			throw new NotFoundError('Child not found');
		}

		// Only primary parent can reset password
		if (childData.primary_parent_id !== user.id) {
			throw new AuthorizationError('Only primary parent can reset child password');
		}

		// Hash new password
		const passwordHash = await hashPassword(new_password);

		// Update password
		const { error: updateError } = await supabase
			.from('children')
			.update({ password_hash: passwordHash })
			.eq('id', childId);

		if (updateError) {
			return json({ error: 'Failed to reset password' }, { status: 500 });
		}

		// Log password reset event (for COPPA compliance)
		// This would be logged to data_access_logs in production

		return json({ success: true });
	} catch (error) {
		const formattedError = formatError(error);
		const statusCode =
			error instanceof AuthorizationError
				? 403
				: error instanceof NotFoundError
					? 404
					: error instanceof ValidationError
						? 400
						: 500;

		return json(formattedError, { status: statusCode });
	}
};

