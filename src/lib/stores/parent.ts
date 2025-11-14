import { writable } from 'svelte/store';
import type { Database } from '../supabase/types';

type Parent = Database['public']['Tables']['parents']['Row'];
type Child = Database['public']['Tables']['children']['Row'];

export interface ParentState {
	parent: Parent | null;
	children: Child[];
	loading: boolean;
	error: string | null;
}

function createParentStore() {
	const { subscribe, set, update } = writable<ParentState>({
		parent: null,
		children: [],
		loading: false,
		error: null
	});

	return {
		subscribe,
		setParent: (parent: Parent | null) => {
			update((state) => ({ ...state, parent }));
		},
		setChildren: (children: Child[]) => {
			update((state) => ({ ...state, children }));
		},
		addChild: (child: Child) => {
			update((state) => ({
				...state,
				children: [...state.children, child]
			}));
		},
		updateChild: (childId: string, updates: Partial<Child>) => {
			update((state) => ({
				...state,
				children: state.children.map((c) => (c.id === childId ? { ...c, ...updates } : c))
			}));
		},
		removeChild: (childId: string) => {
			update((state) => ({
				...state,
				children: state.children.filter((c) => c.id !== childId)
			}));
		},
		setLoading: (loading: boolean) => {
			update((state) => ({ ...state, loading }));
		},
		setError: (error: string | null) => {
			update((state) => ({ ...state, error }));
		},
		reset: () => set({ parent: null, children: [], loading: false, error: null })
	};
}

export const parentStore = createParentStore();

