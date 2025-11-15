<script lang="ts">
	import ParentDashboard from '$lib/components/parent/ParentDashboard.svelte';
	import { onMount } from 'svelte';
	import { getSessionUser } from '$lib/middleware/session';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';

	onMount(async () => {
		// Check authentication - this would be done server-side in a real app
		// For now, we'll check client-side
	});
</script>

<div class="min-h-screen bg-gray-50">
	<ParentDashboard />
</div>

