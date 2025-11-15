<script lang="ts">
	import { onMount } from 'svelte';
	import { childStore } from '$lib/stores/child';
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';
	import ReadingInterestSurvey from './ReadingInterestSurvey.svelte';
	import AvatarCreator from './AvatarCreator.svelte';

	let loading = true;
	let error = '';
	let editingPreferences = false;
	let editingAvatar = false;
	let saving = false;

	onMount(async () => {
		await loadProfile();
	});

	async function loadProfile() {
		loading = true;
		error = '';

		if (!browser) return;

		const sessionToken = localStorage.getItem('child_session');
		if (!sessionToken || !$childStore.child) {
			goto('/login');
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
					localStorage.removeItem('child_session');
					goto('/login');
					return;
				}
				error = 'Failed to load profile';
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

	async function savePreferences() {
		saving = true;
		error = '';

		if (!browser || !$childStore.child) return;

		const sessionToken = localStorage.getItem('child_session');
		const newPreferences = {
			genres: $childStore.child.reading_preferences?.genres || [],
			topics: $childStore.child.reading_preferences?.topics || [],
			formats: $childStore.child.reading_preferences?.formats || []
		};

		try {
			const response = await fetch(`/api/children/${$childStore.child.id}/preferences`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${sessionToken}`
				},
				body: JSON.stringify({
					reading_preferences: newPreferences
				})
			});

			if (!response.ok) {
				const data = await response.json();
				error = data.error || 'Failed to save preferences';
				saving = false;
				return;
			}

			const data = await response.json();
			childStore.setChild(data);
			editingPreferences = false;
		} catch (err) {
			error = 'An unexpected error occurred';
		} finally {
			saving = false;
		}
	}

	async function saveAvatar() {
		saving = true;
		error = '';

		if (!browser || !$childStore.child) return;

		const sessionToken = localStorage.getItem('child_session');
		const newAvatar = $childStore.child.avatar_data || {};

		try {
			const response = await fetch(`/api/children/${$childStore.child.id}/avatar`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${sessionToken}`
				},
				body: JSON.stringify({
					avatar_data: newAvatar
				})
			});

			if (!response.ok) {
				const data = await response.json();
				error = data.error || 'Failed to save avatar';
				saving = false;
				return;
			}

			const data = await response.json();
			childStore.setChild(data);
			editingAvatar = false;
		} catch (err) {
			error = 'An unexpected error occurred';
		} finally {
			saving = false;
		}
	}
</script>

<div class="max-w-2xl mx-auto p-6">
	<div class="mb-6">
		<h1 class="text-3xl font-bold text-gray-900">My Profile</h1>
		<button
			on:click={() => goto('/dashboard')}
			class="mt-2 text-blue-600 hover:underline"
		>
			← Back to Dashboard
		</button>
	</div>

	{#if loading}
		<div class="text-center py-8">
			<p class="text-gray-500">Loading profile...</p>
		</div>
	{:else if error}
		<div class="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
			{error}
		</div>
	{:else if $childStore.child}
		<div class="space-y-6">
			<!-- Basic Info -->
			<div class="p-6 bg-white rounded-lg shadow-md">
				<h2 class="text-xl font-semibold mb-4">Basic Information</h2>
				<div class="space-y-2">
					<p><strong>Name:</strong> {$childStore.child.name}</p>
					<p><strong>Age:</strong> {$childStore.child.age}</p>
					<p><strong>Grade:</strong> Grade {$childStore.child.grade_level}</p>
					<p><strong>Username:</strong> {$childStore.child.username}</p>
				</div>
			</div>

			<!-- Reading Preferences -->
			<div class="p-6 bg-white rounded-lg shadow-md">
				<div class="flex justify-between items-center mb-4">
					<h2 class="text-xl font-semibold">Reading Preferences</h2>
					{#if !editingPreferences}
						<button
							on:click={() => (editingPreferences = true)}
							class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
						>
							Edit
						</button>
					{/if}
				</div>

				{#if editingPreferences}
					<ReadingInterestSurvey bind:surveyData={$childStore.child.reading_preferences} />
					<div class="mt-4 flex space-x-2">
						<button
							on:click={savePreferences}
							disabled={saving}
							class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
						>
							{saving ? 'Saving...' : 'Save'}
						</button>
						<button
							on:click={() => (editingPreferences = false)}
							class="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
						>
							Cancel
						</button>
					</div>
				{:else}
					{#if $childStore.child.reading_preferences}
						<div class="space-y-2">
							{#if $childStore.child.reading_preferences.genres}
								<p><strong>Genres:</strong> {$childStore.child.reading_preferences.genres.join(', ')}</p>
							{/if}
							{#if $childStore.child.reading_preferences.topics}
								<p><strong>Topics:</strong> {$childStore.child.reading_preferences.topics.join(', ')}</p>
							{/if}
							{#if $childStore.child.reading_preferences.formats}
								<p><strong>Formats:</strong> {$childStore.child.reading_preferences.formats.join(', ')}</p>
							{/if}
						</div>
					{:else}
						<p class="text-gray-500">No preferences set yet</p>
					{/if}
				{/if}
			</div>

			<!-- Avatar -->
			<div class="p-6 bg-white rounded-lg shadow-md">
				<div class="flex justify-between items-center mb-4">
					<h2 class="text-xl font-semibold">Avatar</h2>
					{#if !editingAvatar}
						<button
							on:click={() => (editingAvatar = true)}
							class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
						>
							Edit
						</button>
					{/if}
				</div>

				{#if editingAvatar}
					<AvatarCreator bind:avatarData={$childStore.child.avatar_data} />
					<div class="mt-4 flex space-x-2">
						<button
							on:click={saveAvatar}
							disabled={saving}
							class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
						>
							{saving ? 'Saving...' : 'Save'}
						</button>
						<button
							on:click={() => (editingAvatar = false)}
							class="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
						>
							Cancel
						</button>
					</div>
				{:else}
					{#if $childStore.child.avatar_data}
						<div class="space-y-2">
							<p><strong>Hair:</strong> {$childStore.child.avatar_data.hair || 'Not set'}</p>
							<p><strong>Eyes:</strong> {$childStore.child.avatar_data.eyes || 'Not set'}</p>
							<p><strong>Style:</strong> {$childStore.child.avatar_data.clothes || 'Not set'}</p>
						</div>
					{:else}
						<p class="text-gray-500">No avatar set yet</p>
					{/if}
				{/if}
			</div>

			<!-- Password Notice -->
			<div class="p-4 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded">
				<p class="text-sm">
					<strong>Note:</strong> If you need to change your password, please ask your parent to reset it for you.
				</p>
			</div>
		</div>
	{/if}
</div>

