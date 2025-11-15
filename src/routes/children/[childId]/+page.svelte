<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';

	let loading = true;
	let error = '';
	let childData: any = null;

	onMount(async () => {
		const childId = $page.params.childId;
		if (!childId) {
			error = 'Child ID not found';
			loading = false;
			return;
		}

		try {
			const response = await fetch(`/api/children/${childId}`);
			if (!response.ok) {
				if (response.status === 401 || response.status === 403) {
					goto('/parent/dashboard');
					return;
				}
				error = 'Failed to load child data';
				loading = false;
				return;
			}

			childData = await response.json();
		} catch (err) {
			error = 'An unexpected error occurred';
		} finally {
			loading = false;
		}
	});
</script>

<div class="min-h-screen bg-gray-50 p-6">
	<div class="max-w-4xl mx-auto">
		<button
			on:click={() => goto('/parent/dashboard')}
			class="mb-4 text-blue-600 hover:underline"
		>
			← Back to Dashboard
		</button>

		{#if loading}
			<div class="text-center py-8">
				<p class="text-gray-500">Loading child data...</p>
			</div>
		{:else if error}
			<div class="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
				{error}
			</div>
		{:else if childData}
			<div class="bg-white rounded-lg shadow-md p-6">
				<h1 class="text-3xl font-bold mb-6">{childData.name}</h1>
				
				<div class="grid grid-cols-2 gap-6 mb-6">
					<div>
						<p class="text-gray-600">Age</p>
						<p class="text-xl font-semibold">{childData.age}</p>
					</div>
					<div>
						<p class="text-gray-600">Grade Level</p>
						<p class="text-xl font-semibold">Grade {childData.grade_level}</p>
					</div>
					<div>
						<p class="text-gray-600">Username</p>
						<p class="text-xl font-semibold">{childData.username}</p>
					</div>
					<div>
						<p class="text-gray-600">Onboarding Status</p>
						<p class="text-xl font-semibold">
							{childData.onboarding_completed ? 'Completed' : 'Pending'}
						</p>
					</div>
				</div>

				{#if childData.reading_preferences && Object.keys(childData.reading_preferences).length > 0}
					<div class="mt-6">
						<h2 class="text-xl font-semibold mb-4">Reading Preferences</h2>
						<div class="space-y-2">
							{#if childData.reading_preferences.genres}
								<p><strong>Genres:</strong> {childData.reading_preferences.genres.join(', ')}</p>
							{/if}
							{#if childData.reading_preferences.topics}
								<p><strong>Topics:</strong> {childData.reading_preferences.topics.join(', ')}</p>
							{/if}
							{#if childData.reading_preferences.formats}
								<p><strong>Formats:</strong> {childData.reading_preferences.formats.join(', ')}</p>
							{/if}
						</div>
					</div>
				{/if}
			</div>
		{/if}
	</div>
</div>


