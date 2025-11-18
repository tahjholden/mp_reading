<script lang="ts">
	import { onMount } from 'svelte';
	import { booksStore, type Book } from '$lib/stores/books';
	import BookCard from './BookCard.svelte';
	import BookFilters from './BookFilters.svelte';
	import BookSearch from './BookSearch.svelte';

	let loading = true;
	let error: string | null = null;

	onMount(async () => {
		await loadBooks();
	});

	async function loadBooks() {
		loading = true;
		error = null;
		booksStore.setLoading(true);
		booksStore.setError(null);

		try {
			const filters = $booksStore.filters;
			const params = new URLSearchParams();

			if (filters.genre && filters.genre.length > 0) {
				filters.genre.forEach((g) => params.append('genre', g));
			}
			if (filters.reading_level_min) {
				params.append('reading_level_min', filters.reading_level_min.toString());
			}
			if (filters.reading_level_max) {
				params.append('reading_level_max', filters.reading_level_max.toString());
			}
			if (filters.grade_level) {
				params.append('grade_level', filters.grade_level.toString());
			}
			if (filters.search) {
				params.append('search', filters.search);
			}

			params.append('page', $booksStore.pagination.page.toString());
			params.append('limit', $booksStore.pagination.limit.toString());

			const response = await fetch(`/api/books?${params.toString()}`);
			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || 'Failed to load books');
			}

			booksStore.setBooks(data.books);
			booksStore.setPagination(data.pagination);
		} catch (err) {
			const message = err instanceof Error ? err.message : 'An unexpected error occurred';
			error = message;
			booksStore.setError(message);
		} finally {
			loading = false;
			booksStore.setLoading(false);
		}
	}

	function handleFiltersChange() {
		booksStore.setPagination({ ...$booksStore.pagination, page: 1 });
		loadBooks();
	}

	function handleSearchChange() {
		booksStore.setPagination({ ...$booksStore.pagination, page: 1 });
		loadBooks();
	}

	function handlePageChange(newPage: number) {
		booksStore.setPagination({ ...$booksStore.pagination, page: newPage });
		loadBooks();
	}
</script>

<div class="space-y-6">
	<!-- Filters and Search -->
	<div class="bg-white p-4 rounded-lg shadow-md space-y-4">
		<BookSearch
			value={$booksStore.filters.search || ''}
			on:change={(e) => {
				booksStore.setFilters({ ...$booksStore.filters, search: e.detail });
				handleSearchChange();
			}}
		/>
		<BookFilters
			filters={$booksStore.filters}
			on:change={(e) => {
				booksStore.setFilters(e.detail);
				handleFiltersChange();
			}}
		/>
	</div>

	<!-- Loading State -->
	{#if loading}
		<div class="text-center py-12" role="status" aria-live="polite">
			<p class="text-gray-500">Loading books...</p>
		</div>
	<!-- Error State -->
	{:else if error}
		<div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded" role="alert">
			<p>{error}</p>
			<button
				on:click={loadBooks}
				class="mt-2 text-sm underline hover:no-underline"
				aria-label="Retry loading books"
			>
				Try again
			</button>
		</div>
	<!-- Books Grid -->
	{:else if $booksStore.books.length > 0}
		<div>
			<div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
				{#each $booksStore.books as book (book.id)}
					<BookCard {book} />
				{/each}
			</div>

			<!-- Pagination -->
			{#if $booksStore.pagination.total_pages > 1}
				<div class="mt-8 flex justify-center items-center gap-2" role="navigation" aria-label="Pagination">
					<button
						on:click={() => handlePageChange($booksStore.pagination.page - 1)}
						disabled={$booksStore.pagination.page === 1}
						class="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500"
						aria-label="Previous page"
					>
						Previous
					</button>

					<span class="text-sm text-gray-600" aria-current="page">
						Page {$booksStore.pagination.page} of {$booksStore.pagination.total_pages}
					</span>

					<button
						on:click={() => handlePageChange($booksStore.pagination.page + 1)}
						disabled={$booksStore.pagination.page >= $booksStore.pagination.total_pages}
						class="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500"
						aria-label="Next page"
					>
						Next
					</button>
				</div>
			{/if}
		</div>
	<!-- Empty State -->
	{:else}
		<div class="text-center py-12" role="status">
			<p class="text-gray-500 text-lg mb-2">No books found</p>
			<p class="text-sm text-gray-400">Try adjusting your filters or search terms</p>
		</div>
	{/if}
</div>

