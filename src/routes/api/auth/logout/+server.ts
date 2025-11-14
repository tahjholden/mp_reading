import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createClient } from '$lib/supabase/server';

export const POST: RequestHandler = async (event) => {
	try {
		const supabase = createClient(event);

		// Sign out from Supabase (for parent accounts)
		const { error } = await supabase.auth.signOut();

		if (error) {
			return json({ error: error.message }, { status: 500 });
		}

		// For child accounts, the session token is handled client-side
		// The client should clear the token from storage

		return json({ success: true });
	} catch (error) {
		return json({ error: 'Logout failed' }, { status: 500 });
	}
};

