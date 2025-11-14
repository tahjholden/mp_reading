import { writable } from 'svelte/store';
import type { Database } from '../supabase/types';

type Child = Database['public']['Tables']['children']['Row'];
type OnboardingData = Database['public']['Tables']['onboarding_data']['Row'];

export interface ChildState {
	child: Child | null;
	onboardingData: OnboardingData | null;
	loading: boolean;
	error: string | null;
}

function createChildStore() {
	const { subscribe, set, update } = writable<ChildState>({
		child: null,
		onboardingData: null,
		loading: false,
		error: null
	});

	return {
		subscribe,
		setChild: (child: Child | null) => {
			update((state) => ({ ...state, child }));
		},
		setOnboardingData: (onboardingData: OnboardingData | null) => {
			update((state) => ({ ...state, onboardingData }));
		},
		updateChild: (updates: Partial<Child>) => {
			update((state) => ({
				...state,
				child: state.child ? { ...state.child, ...updates } : null
			}));
		},
		setLoading: (loading: boolean) => {
			update((state) => ({ ...state, loading }));
		},
		setError: (error: string | null) => {
			update((state) => ({ ...state, error }));
		},
		reset: () => set({ child: null, onboardingData: null, loading: false, error: null })
	};
}

export const childStore = createChildStore();

