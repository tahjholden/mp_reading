<script lang="ts">
	import type { BookFilters } from '$lib/stores/books';

	interface Props {
		filters: BookFilters;
	}

	let { filters = $bindable() } = $props<Props>();

	const genres = [
		'Adventure',
		'Fantasy',
		'Mystery',
		'Science Fiction',
		'Historical Fiction',
		'Realistic Fiction',
		'Non-Fiction',
		'Biography',
		'Poetry',
		'Graphic Novels'
	];

	const gradeLevels = [4, 5, 6];

	function toggleGenre(genre: string) {
		const currentGenres = filters.genre || [];
		const newGenres = currentGenres.includes(genre)
			? currentGenres.filter((g) => g !== genre)
			: [...currentGenres, genre];

		filters = { ...filters, genre: newGenres };
		$dispatch('change', filters);
	}

	function setGradeLevel(grade: number | undefined) {
		filters = { ...filters, grade_level: grade };
		$dispatch('change', filters);
	}

	function clearFilters() {
		filters = {};
		$dispatch('change', {});
	}
</script>

<div class="space-y-4" role="group" aria-labelledby="filters-heading">
	<div class="flex justify-between items-center">
		<h3 id="filters-heading" class="text-lg font-semibold">Filters</h3>
		{#if filters.genre?.length || filters.grade_level}
			<button
				on:click={clearFilters}
				class="text-sm text-blue-600 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
				aria-label="Clear all filters"
			>
				Clear filters
			</button>
		{/if}
	</div>

	<!-- Genre Filter -->
	<div>
		<label class="block text-sm font-medium text-gray-700 mb-2">Genres</label>
		<div class="flex flex-wrap gap-2">
			{#each genres as genre}
				<button
					type="button"
					on:click={() => toggleGenre(genre)}
					aria-pressed={(filters.genre || []).includes(genre)}
					aria-label="Filter by {genre} genre"
					class="px-3 py-1 rounded-md border-2 text-sm {(filters.genre || []).includes(genre)
						? 'bg-blue-600 text-white border-blue-600'
						: 'bg-white text-gray-700 border-gray-300 hover:border-blue-500'} focus:outline-none focus:ring-2 focus:ring-blue-500"
				>
					{genre}
				</button>
			{/each}
		</div>
	</div>

	<!-- Grade Level Filter -->
	<div>
		<label class="block text-sm font-medium text-gray-700 mb-2">Grade Level</label>
		<div class="flex gap-2">
			<button
				type="button"
				on:click={() => setGradeLevel(undefined)}
				aria-pressed={!filters.grade_level}
				aria-label="Show all grade levels"
				class="px-3 py-1 rounded-md border-2 text-sm {!filters.grade_level
					? 'bg-blue-600 text-white border-blue-600'
					: 'bg-white text-gray-700 border-gray-300 hover:border-blue-500'} focus:outline-none focus:ring-2 focus:ring-blue-500"
			>
				All
			</button>
			{#each gradeLevels as grade}
				<button
					type="button"
					on:click={() => setGradeLevel(grade)}
					aria-pressed={filters.grade_level === grade}
					aria-label="Filter by grade {grade}"
					class="px-3 py-1 rounded-md border-2 text-sm {filters.grade_level === grade
						? 'bg-blue-600 text-white border-blue-600'
						: 'bg-white text-gray-700 border-gray-300 hover:border-blue-500'} focus:outline-none focus:ring-2 focus:ring-blue-500"
				>
					Grade {grade}
				</button>
			{/each}
		</div>
	</div>
</div>

