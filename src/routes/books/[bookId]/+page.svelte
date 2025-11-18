<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import BookDetail from '$lib/components/books/BookDetail.svelte';
	import type { Book } from '$lib/stores/books';

	let book: Book | null = null;
	let loading = true;
	let error: string | null = null;

	onMount(async () => {
		const bookId = $page.params.bookId;
		if (!bookId) {
			error = 'Book ID is required';
			loading = false;
			return;
		}

		await loadBook(bookId);
	});

	async function loadBook(bookId: string) {
		loading = true;
		error = null;

		try {
			const response = await fetch(`/api/books/${bookId}`);
			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || 'Failed to load book');
			}

			book = data;
		} catch (err) {
			const message = err instanceof Error ? err.message : 'An unexpected error occurred';
			error = message;
		} finally {
			loading = false;
		}
	}
</script>

<svelte:head>
	<title>{book?.title || 'Book Details'} - Reading App</title>
</svelte:head>

<div class="max-w-7xl mx-auto p-4 sm:p-6">
	{#if loading}
		<div class="text-center py-12" role="status" aria-live="polite">
			<p class="text-gray-500">Loading book details...</p>
		</div>
	{:else if error}
		<div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded" role="alert">
			<p>{error}</p>
			<button
				on:click={() => goto('/books')}
				class="mt-2 text-sm underline hover:no-underline"
			>
				Back to Library
			</button>
		</div>
	{:else if book}
		<div class="mb-4">
			<button
				on:click={() => goto('/books')}
				class="text-blue-600 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
				aria-label="Back to book library"
			>
				← Back to Library
			</button>
		</div>
		<BookDetail {book} />
	{:else}
		<div class="text-center py-12">
			<p class="text-gray-500">Book not found</p>
			<button
				on:click={() => goto('/books')}
				class="mt-4 text-blue-600 hover:underline"
			>
				Back to Library
			</button>
		</div>
	{/if}
</div>



