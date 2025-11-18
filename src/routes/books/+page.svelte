<script lang="ts">
	import { onMount } from 'svelte';
	import { requireAuth } from '$lib/middleware/session';
	import BookCatalog from '$lib/components/books/BookCatalog.svelte';
	import { goto } from '$app/navigation';

	onMount(async () => {
		// Check authentication
		try {
			// This will be handled by layout or middleware
			// For now, just ensure user is authenticated
		} catch (error) {
			goto('/login');
		}
	});
</script>

<svelte:head>
	<title>Book Library - Reading App</title>
</svelte:head>

<div class="max-w-7xl mx-auto p-4 sm:p-6">
	<div class="mb-6">
		<h1 class="text-3xl font-bold text-gray-900 mb-2">Book Library</h1>
		<p class="text-gray-600">Discover books to read and explore new stories</p>
	</div>

	<BookCatalog />
</div>



