/**
 * Test utilities for creating test users and managing test data
 * These helpers make it easier to set up test scenarios
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
import { hashPassword } from '$lib/utils/password';

export interface TestParent {
	id: string;
	email: string;
	password: string;
	authToken: string;
	supabase: SupabaseClient;
}

export interface TestChild {
	id: string;
	username: string;
	password: string;
	parentId: string;
	supabase: SupabaseClient;
}

/**
 * Create a test parent account with authentication
 */
export async function createTestParent(
	email?: string,
	password: string = 'TestParent123!'
): Promise<TestParent> {
	const supabase = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
		db: { schema: 'mp_reading' }
	});

	const testEmail = email || `test-parent-${Date.now()}@example.com`;

	// Create parent account via Supabase Auth
	const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
		email: testEmail,
		password: password,
		options: {
			data: { user_type: 'parent' }
		}
	});

	if (signUpError || !signUpData.user) {
		throw new Error(`Failed to create test parent: ${signUpError?.message || 'Unknown error'}`);
	}

	const parentId = signUpData.user.id;

	// Create parent profile in database
	const { error: profileError } = await supabase.from('parents').insert({
		id: parentId,
		email: testEmail
	});

	if (profileError) {
		throw new Error(`Failed to create parent profile: ${profileError.message}`);
	}

	// Sign in to get auth token
	const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
		email: testEmail,
		password: password
	});

	if (signInError || !signInData.session) {
		throw new Error(`Failed to sign in test parent: ${signInError?.message || 'Unknown error'}`);
	}

	return {
		id: parentId,
		email: testEmail,
		password: password,
		authToken: signInData.session.access_token,
		supabase
	};
}

/**
 * Create a test child account linked to a parent
 */
export async function createTestChild(
	parentId: string,
	username?: string,
	password: string = 'TestChild123!',
	options?: {
		name?: string;
		age?: number;
		grade_level?: number;
		onboarding_completed?: boolean;
	}
): Promise<TestChild> {
	const supabase = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
		db: { schema: 'mp_reading' }
	});

	const testUsername = username || `test-child-${Date.now()}`;
	const passwordHash = await hashPassword(password);

	// Create child profile
	const { data: childData, error: childError } = await supabase
		.from('children')
		.insert({
			primary_parent_id: parentId,
			username: testUsername,
			password_hash: passwordHash,
			name: options?.name || 'Test Child',
			age: options?.age || 10,
			grade_level: options?.grade_level || 5,
			onboarding_completed: options?.onboarding_completed ?? false
		})
		.select()
		.single();

	if (childError || !childData) {
		throw new Error(`Failed to create test child: ${childError?.message || 'Unknown error'}`);
	}

	return {
		id: childData.id,
		username: testUsername,
		password: password,
		parentId: parentId,
		supabase
	};
}

/**
 * Create a test child with Supabase Auth account (for API testing)
 */
export async function createTestChildWithAuth(
	parentId: string,
	email?: string,
	password: string = 'TestChild123!',
	options?: {
		username?: string;
		name?: string;
		age?: number;
		grade_level?: number;
		onboarding_completed?: boolean;
	}
): Promise<TestChild & { authToken: string }> {
	const supabase = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
		db: { schema: 'mp_reading' }
	});

	const testEmail = email || `test-child-${Date.now()}@example.com`;
	const testUsername = options?.username || `test-child-${Date.now()}`;

	// Create child auth account
	const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
		email: testEmail,
		password: password,
		options: {
			data: { user_type: 'child' }
		}
	});

	if (signUpError || !signUpData.user) {
		throw new Error(`Failed to create child auth: ${signUpError?.message || 'Unknown error'}`);
	}

	const childId = signUpData.user.id;
	const passwordHash = await hashPassword(password);

	// Create child profile
	const { data: childData, error: childError } = await supabase
		.from('children')
		.insert({
			id: childId,
			primary_parent_id: parentId,
			username: testUsername,
			password_hash: passwordHash,
			name: options?.name || 'Test Child',
			age: options?.age || 10,
			grade_level: options?.grade_level || 5,
			onboarding_completed: options?.onboarding_completed ?? false
		})
		.select()
		.single();

	if (childError || !childData) {
		throw new Error(`Failed to create child profile: ${childError?.message || 'Unknown error'}`);
	}

	// Sign in to get auth token
	const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
		email: testEmail,
		password: password
	});

	if (signInError || !signInData.session) {
		throw new Error(`Failed to sign in child: ${signInError?.message || 'Unknown error'}`);
	}

	return {
		id: childId,
		username: testUsername,
		password: password,
		parentId: parentId,
		authToken: signInData.session.access_token,
		supabase
	};
}

/**
 * Clean up test parent and all associated children
 */
export async function cleanupTestParent(parentId: string): Promise<void> {
	const supabase = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
		db: { schema: 'mp_reading' }
	});

	// Delete children first (due to foreign key constraints)
	await supabase.from('children').delete().eq('primary_parent_id', parentId);

	// Delete parent profile
	await supabase.from('parents').delete().eq('id', parentId);

	// Sign out (auth user cleanup happens automatically or via Supabase dashboard)
	await supabase.auth.signOut();
}

/**
 * Clean up test child
 */
export async function cleanupTestChild(childId: string): Promise<void> {
	const supabase = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
		db: { schema: 'mp_reading' }
	});

	await supabase.from('children').delete().eq('id', childId);
	await supabase.auth.signOut();
}

/**
 * Create a test book
 */
export async function createTestBook(bookData: {
	title: string;
	author: string;
	genre: string[];
	reading_level_min: number;
	reading_level_max: number;
	lexile_score: number;
	grade_level_min: number;
	grade_level_max: number;
	summary?: string;
	word_count?: number;
	page_count?: number;
	is_active?: boolean;
}): Promise<string> {
	const supabase = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
		db: { schema: 'mp_reading' }
	});

	const { data, error } = await supabase
		.from('books')
		.insert({
			...bookData,
			is_active: bookData.is_active ?? true
		})
		.select()
		.single();

	if (error || !data) {
		throw new Error(`Failed to create test book: ${error?.message || 'Unknown error'}`);
	}

	return data.id;
}

/**
 * Clean up test book
 */
export async function cleanupTestBook(bookId: string): Promise<void> {
	const supabase = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
		db: { schema: 'mp_reading' }
	});

	await supabase.from('books').delete().eq('id', bookId);
}

/**
 * Authenticate with an existing parent account
 * Useful for using your real account in tests
 */
export async function useExistingParent(
	email: string,
	password: string
): Promise<TestParent> {
	const supabase = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
		db: { schema: 'mp_reading' }
	});

	// Sign in to get auth token
	const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
		email: email,
		password: password
	});

	if (signInError || !signInData.session || !signInData.user) {
		throw new Error(`Failed to sign in: ${signInError?.message || 'Unknown error'}`);
	}

	// Get parent profile to verify it exists
	const { data: parentData, error: parentError } = await supabase
		.from('parents')
		.select('id, email')
		.eq('id', signInData.user.id)
		.single();

	if (parentError || !parentData) {
		throw new Error(`Parent profile not found: ${parentError?.message || 'Unknown error'}`);
	}

	return {
		id: signInData.user.id,
		email: email,
		password: password,
		authToken: signInData.session.access_token,
		supabase
	};
}

/**
 * Get existing child account by username
 * Note: This doesn't authenticate the child, just retrieves their info
 */
export async function getExistingChild(
	parentId: string,
	username: string
): Promise<TestChild | null> {
	const supabase = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
		db: { schema: 'mp_reading' }
	});

	const { data: childData, error } = await supabase
		.from('children')
		.select('id, username, primary_parent_id')
		.eq('primary_parent_id', parentId)
		.eq('username', username)
		.single();

	if (error || !childData) {
		return null;
	}

	return {
		id: childData.id,
		username: childData.username,
		password: '', // Password not stored, would need to be provided separately
		parentId: childData.primary_parent_id,
		supabase
	};
}

/**
 * Get Supabase client for direct database access
 */
export function getTestSupabaseClient(): SupabaseClient {
	return createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
		db: { schema: 'mp_reading' }
	});
}

