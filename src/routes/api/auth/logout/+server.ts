import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createClient } from '$lib/supabase/server';
import { formatError, AuthenticationError } from '$lib/utils/errors';

export const POST: RequestHandler = async (event) => {
	try {
		const supabase = createClient(event);

		// Sign out from Supabase (for parent accounts)
		const { error } = await supabase.auth.signOut();

		if (error) {
			throw new AuthenticationError(error.message);
		}

		// For child accounts, the session token is handled client-side
		// The client should clear the token from storage

		return json({ success: true });
	} catch (error) {
		const formattedError = formatError(error);
		const statusCode = error instanceof AuthenticationError ? 401 : 500;
		return json(formattedError, { status: statusCode });
	}
};

