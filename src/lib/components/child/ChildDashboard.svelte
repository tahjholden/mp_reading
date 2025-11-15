<script lang="ts">
	import { onMount } from 'svelte';
	import { childStore } from '$lib/stores/child';
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';

	let loading = true;
	let error = '';

	onMount(async () => {
		await loadChildData();
	});

	async function loadChildData() {
		loading = true;
		error = '';

		if (!browser) return;

		// Get child session token
		const sessionToken = localStorage.getItem('child_session');
		if (!sessionToken) {
			// Not logged in, redirect to login
			goto('/login');
			return;
		}

		// Get child ID from token (would need to decode JWT in real implementation)
		// For now, get from store or URL
		if (!$childStore.child) {
			error = 'Child information not found';
			loading = false;
			return;
		}

		try {
			const response = await fetch(`/api/children/${$childStore.child.id}`, {
				headers: {
					Authorization: `Bearer ${sessionToken}`
				}
			});

			if (!response.ok) {
				if (response.status === 401 || response.status === 403) {
					// Session expired or invalid, redirect to login
					localStorage.removeItem('child_session');
					goto('/login');
					return;
				}
				error = 'Failed to load dashboard';
				loading = false;
				return;
			}

			const data = await response.json();
			childStore.setChild(data);
		} catch (err) {
			error = 'An unexpected error occurred';
		} finally {
			loading = false;
		}
	}

	function viewProfile() {
		goto('/profile');
	}
</script>

<div class="max-w-4xl mx-auto p-6">
	<div class="mb-6">
		<h1 class="text-3xl font-bold text-gray-900">
			Welcome, {$childStore.child?.name || 'Student'}!
		</h1>
		<p class="text-gray-600 mt-2">Let's continue your reading journey</p>
	</div>

	{#if loading}
		<div class="text-center py-8">
			<p class="text-gray-500">Loading your dashboard...</p>
		</div>
	{:else if error}
		<div class="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
			{error}
		</div>
	{:else if $childStore.child}
		<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
			<!-- Reading Progress Card -->
			<div class="p-6 bg-white rounded-lg shadow-md">
				<h2 class="text-xl font-semibold mb-4">Reading Progress</h2>
				<div class="space-y-2">
					<p class="text-gray-600">Books Read: 0</p>
					<p class="text-gray-600">Minutes Read: 0</p>
					<p class="text-gray-600">Current Streak: 0 days</p>
				</div>
				<p class="text-sm text-gray-500 mt-4">Start reading to see your progress!</p>
			</div>

			<!-- Achievements Card -->
			<div class="p-6 bg-white rounded-lg shadow-md">
				<h2 class="text-xl font-semibold mb-4">Achievements</h2>
				<div class="space-y-2">
					<p class="text-gray-600">Total Achievements: 0</p>
					<p class="text-sm text-gray-500">Complete reading challenges to earn achievements!</p>
				</div>
			</div>

			<!-- Recommendations Card -->
			<div class="p-6 bg-white rounded-lg shadow-md">
				<h2 class="text-xl font-semibold mb-4">Recommended Books</h2>
				<p class="text-sm text-gray-500">Based on your interests, we'll recommend books here!</p>
			</div>

			<!-- Quick Actions Card -->
			<div class="p-6 bg-white rounded-lg shadow-md">
				<h2 class="text-xl font-semibold mb-4">Quick Actions</h2>
				<div class="space-y-2">
					<button
						on:click={viewProfile}
						class="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
					>
						View Profile
					</button>
					<button
						on:click={() => goto('/books')}
						class="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
					>
						Browse Books
					</button>
				</div>
			</div>
		</div>

		<!-- Reading Preferences Preview -->
		<div class="mt-6 p-6 bg-white rounded-lg shadow-md">
			<h2 class="text-xl font-semibold mb-4">Your Reading Interests</h2>
			{#if $childStore.child.reading_preferences}
				<div class="space-y-2">
					{#if $childStore.child.reading_preferences.genres}
						<p class="text-gray-600">
							<strong>Genres:</strong> {$childStore.child.reading_preferences.genres.join(', ')}
						</p>
					{/if}
					{#if $childStore.child.reading_preferences.topics}
						<p class="text-gray-600">
							<strong>Topics:</strong> {$childStore.child.reading_preferences.topics.join(', ')}
						</p>
					{/if}
				</div>
			{:else}
				<p class="text-gray-500">Update your profile to set reading preferences</p>
			{/if}
		</div>
	{/if}
</div>

