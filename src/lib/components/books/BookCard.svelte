<script lang="ts">
	import type { Book } from '$lib/stores/books';
	import { formatReadingLevel } from '$lib/utils/reading-level';
	import { goto } from '$app/navigation';

	interface Props {
		book: Book;
	}

	const { book } = $props<Props>();

	function handleClick() {
		goto(`/books/${book.id}`);
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			handleClick();
		}
	}
</script>

<article
	class="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer overflow-hidden"
	on:click={handleClick}
	on:keydown={handleKeydown}
	role="button"
	tabindex="0"
	aria-label="View details for {book.title} by {book.author || 'Unknown author'}"
>
	<div class="aspect-[3/4] bg-gray-200 overflow-hidden">
		{#if book.cover_image_url}
			<img
				src={book.cover_image_url}
				alt="Cover for {book.title}"
				class="w-full h-full object-cover"
			/>
		{:else}
			<div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100">
				<span class="text-4xl" aria-hidden="true">📚</span>
			</div>
		{/if}
	</div>

	<div class="p-4">
		<h3 class="font-semibold text-lg mb-1 line-clamp-2" title={book.title}>
			{book.title}
		</h3>
		{#if book.author}
			<p class="text-sm text-gray-600 mb-2">by {book.author}</p>
		{/if}

		<div class="flex flex-wrap gap-2 mb-2">
			{#each book.genre.slice(0, 2) as genre}
				<span
					class="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
					aria-label="Genre: {genre}"
				>
					{genre}
				</span>
			{/each}
			{#if book.genre.length > 2}
				<span class="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
					+{book.genre.length - 2}
				</span>
			{/if}
		</div>

		{#if book.lexile_score || book.grade_level_min}
			<p class="text-xs text-gray-500">
				{formatReadingLevel(book.lexile_score, book.grade_level_min, book.grade_level_max)}
			</p>
		{/if}
	</div>
</article>



