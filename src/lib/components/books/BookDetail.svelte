<script lang="ts">
	import type { Book } from '$lib/stores/books';
	import { formatReadingLevel, calculateReadingTime } from '$lib/utils/reading-level';
	import { goto } from '$app/navigation';

	interface Props {
		book: Book;
	}

	const { book } = $props<Props>();

	const readingTime = calculateReadingTime(book.word_count);

	function handleStartReading() {
		// TODO: Link to reading interface (Feature 004)
		goto(`/read/${book.id}`);
	}
</script>

<article class="max-w-4xl mx-auto">
	<div class="bg-white rounded-lg shadow-md overflow-hidden">
		<div class="md:flex">
			<!-- Cover Image -->
			<div class="md:w-1/3 bg-gray-200 flex items-center justify-center p-8">
				{#if book.cover_image_url}
					<img
						src={book.cover_image_url}
						alt="Cover for {book.title}"
						class="max-w-full max-h-96 object-contain"
					/>
				{:else}
					<div class="text-9xl" aria-hidden="true">📚</div>
				{/if}
			</div>

			<!-- Book Info -->
			<div class="md:w-2/3 p-6 md:p-8">
				<h1 class="text-3xl font-bold text-gray-900 mb-2">{book.title}</h1>
				{#if book.author}
					<p class="text-xl text-gray-600 mb-4">by {book.author}</p>
				{/if}

				<!-- Reading Level -->
				{#if book.lexile_score || book.grade_level_min}
					<div class="mb-4">
						<p class="text-sm font-medium text-gray-700 mb-1">Reading Level</p>
						<p class="text-gray-600">
							{formatReadingLevel(book.lexile_score, book.grade_level_min, book.grade_level_max)}
						</p>
					</div>
				{/if}

				<!-- Genres -->
				{#if book.genre && book.genre.length > 0}
					<div class="mb-4">
						<p class="text-sm font-medium text-gray-700 mb-2">Genres</p>
						<div class="flex flex-wrap gap-2">
							{#each book.genre as genre}
								<span
									class="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
									aria-label="Genre: {genre}"
								>
									{genre}
								</span>
							{/each}
						</div>
					</div>
				{/if}

				<!-- Book Stats -->
				<div class="grid grid-cols-2 gap-4 mb-6">
					{#if book.page_count}
						<div>
							<p class="text-sm font-medium text-gray-700">Pages</p>
							<p class="text-lg text-gray-900">{book.page_count}</p>
						</div>
					{/if}
					{#if readingTime}
						<div>
							<p class="text-sm font-medium text-gray-700">Reading Time</p>
							<p class="text-lg text-gray-900">~{readingTime} minutes</p>
						</div>
					{/if}
				</div>

				<!-- Start Reading Button -->
				<button
					on:click={handleStartReading}
					class="w-full md:w-auto px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
					aria-label="Start reading {book.title}"
				>
					Start Reading
				</button>
			</div>
		</div>

		<!-- Summary -->
		{#if book.summary}
			<div class="p-6 md:p-8 border-t border-gray-200">
				<h2 class="text-xl font-semibold text-gray-900 mb-3">About This Book</h2>
				<p class="text-gray-700 leading-relaxed whitespace-pre-line">{book.summary}</p>
			</div>
		{/if}
	</div>
</article>



