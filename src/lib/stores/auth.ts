import { writable } from 'svelte/store';
import type { User } from '@supabase/supabase-js';
import { createClient } from '../supabase/client';

export interface AuthState {
	user: User | null;
	loading: boolean;
	error: string | null;
}

function createAuthStore() {
	const { subscribe, set, update } = writable<AuthState>({
		user: null,
		loading: true,
		error: null
	});

	const supabase = createClient();

	// Initialize auth state
	supabase.auth.getSession().then(({ data: { session } }) => {
		update((state) => ({
			...state,
			user: session?.user ?? null,
			loading: false
		}));
	});

	// Listen for auth changes
	supabase.auth.onAuthStateChange((_event, session) => {
		update((state) => ({
			...state,
			user: session?.user ?? null,
			loading: false
		}));
	});

	return {
		subscribe,
		login: async (email: string, password: string) => {
			update((state) => ({ ...state, loading: true, error: null }));
			const { data, error } = await supabase.auth.signInWithPassword({
				email,
				password
			});
			if (error) {
				update((state) => ({ ...state, loading: false, error: error.message }));
				return { error };
			}
			update((state) => ({
				...state,
				user: data.user,
				loading: false
			}));
			return { data };
		},
		logout: async () => {
			await supabase.auth.signOut();
			set({ user: null, loading: false, error: null });
		},
		reset: () => set({ user: null, loading: false, error: null })
	};
}

export const authStore = createAuthStore();

