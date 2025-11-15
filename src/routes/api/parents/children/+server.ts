import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createClient } from '$lib/supabase/server';
import { getSessionUser, requireAuth } from '$lib/middleware/session';
import { createChildProfile } from '$lib/server/api/children/create';
import { formatError, AuthenticationError } from '$lib/utils/errors';

export const GET: RequestHandler = async (event) => {
	try {
		const user = await requireAuth(event);
		if (user.type !== 'parent') {
			return json({ error: 'Only parents can access this endpoint' }, { status: 403 });
		}

		const supabase = createClient(event);

		// Get all children for this parent
		const { data: children, error } = await supabase
			.from('children')
			.select('*')
			.eq('primary_parent_id', user.id)
			.order('created_at', { ascending: false });

		if (error) {
			return json({ error: error.message }, { status: 500 });
		}

		// Remove password_hash from response
		const childrenWithoutPasswords = children?.map(({ password_hash, ...child }) => child) || [];

		return json({ children: childrenWithoutPasswords });
	} catch (error) {
		const formattedError = formatError(error);
		const statusCode = error instanceof AuthenticationError ? 401 : 500;
		return json(formattedError, { status: statusCode });
	}
};

export const POST: RequestHandler = async (event) => {
	try {
		const user = await requireAuth(event);
		if (user.type !== 'parent') {
			return json({ error: 'Only parents can create children' }, { status: 403 });
		}

		const { name, age, grade_level, username, password, email } = await event.request.json();

		const supabase = createClient(event);

		// Create child profile
		const { data: childData, error: childError } = await createChildProfile(supabase, {
			name,
			age,
			grade_level,
			username,
			password,
			email,
			primary_parent_id: user.id
		});

		if (childError) {
			// Check if it's a validation error
			if (childError instanceof Error && childError.message.includes('already taken')) {
				return json({ error: childError.message }, { status: 400 });
			}
			return json({ error: 'Failed to create child profile' }, { status: 500 });
		}

		if (!childData) {
			return json({ error: 'Failed to create child profile' }, { status: 500 });
		}

		// Remove password_hash from response
		const { password_hash, ...childWithoutPassword } = childData;

		return json({ ...childWithoutPassword }, { status: 201 });
	} catch (error) {
		const formattedError = formatError(error);
		const statusCode = error instanceof AuthenticationError ? 401 : 500;
		return json(formattedError, { status: statusCode });
	}
};

