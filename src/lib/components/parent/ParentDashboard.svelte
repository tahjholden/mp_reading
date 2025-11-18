<script lang="ts">
	import { onMount } from 'svelte';
	import { parentStore } from '$lib/stores/parent';
	import AddChildForm from './AddChildForm.svelte';
	import { goto } from '$app/navigation';

	let showAddChildForm = false;
	let loading = true;

	onMount(async () => {
		await loadChildren();
	});

	async function loadChildren() {
		loading = true;
		parentStore.setLoading(true);

		try {
			const response = await fetch('/api/parents/children');
			const data = await response.json();

			if (response.ok) {
				parentStore.setChildren(data.children || []);
			}
		} catch (error) {
			parentStore.setError('Failed to load children');
		} finally {
			loading = false;
			parentStore.setLoading(false);
		}
	}

	function handleAddChild() {
		showAddChildForm = true;
	}

	function handleChildAdded() {
		showAddChildForm = false;
		loadChildren();
	}

	function viewChild(childId: string) {
		goto(`/children/${childId}`);
	}
</script>

<div class="max-w-4xl mx-auto p-4 sm:p-6">
	<div class="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
		<h1 class="text-2xl sm:text-3xl font-bold text-gray-900">Parent Dashboard</h1>
		<button
			on:click={handleAddChild}
			class="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
		>
			Add Child
		</button>
	</div>

	{#if showAddChildForm}
		<div class="mb-6">
			<AddChildForm on:child-added={handleChildAdded} />
		</div>
	{/if}

	{#if loading}
		<div class="text-center py-8">
			<p class="text-gray-500">Loading...</p>
		</div>
	{:else}
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
			{#each $parentStore.children as child}
				<div
					class="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer"
					on:click={() => viewChild(child.id)}
				>
					<h3 class="text-xl font-semibold mb-2">{child.name}</h3>
					<p class="text-gray-600 mb-2">Age: {child.age} | Grade {child.grade_level}</p>
					<p class="text-sm text-gray-500">Username: {child.username}</p>
					{#if !child.onboarding_completed}
						<span class="inline-block mt-2 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">
							Onboarding Pending
						</span>
					{:else}
						<span class="inline-block mt-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
							Ready
						</span>
					{/if}
				</div>
			{:else}
				<div class="col-span-full text-center py-8">
					<p class="text-gray-500 mb-4">No children added yet.</p>
					<button
						on:click={handleAddChild}
						class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
					>
						Add Your First Child
					</button>
				</div>
			{/each}
		</div>
	{/if}
</div>

