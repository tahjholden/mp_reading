<script lang="ts">
	interface Props {
		value?: string;
	}

	let { value = $bindable('') } = $props<Props>();

	let searchInput: HTMLInputElement;
	let debounceTimer: ReturnType<typeof setTimeout> | null = null;

	function handleInput(event: Event) {
		const target = event.target as HTMLInputElement;
		value = target.value;

		// Debounce search
		if (debounceTimer) {
			clearTimeout(debounceTimer);
		}

		debounceTimer = setTimeout(() => {
			$dispatch('change', value);
		}, 300);
	}

	function clearSearch() {
		value = '';
		searchInput?.focus();
		$dispatch('change', '');
	}
</script>

<div class="relative">
	<label for="book-search" class="sr-only">Search books</label>
	<div class="relative">
		<input
			id="book-search"
			bind:this={searchInput}
			type="text"
			bind:value={value}
			on:input={handleInput}
			placeholder="Search by title, author, or topic..."
			class="w-full px-4 py-2 pl-10 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
			aria-label="Search books by title, author, or topic"
		/>
		<div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none" aria-hidden="true">
			<span class="text-gray-400">🔍</span>
		</div>
		{#if value}
			<button
				type="button"
				on:click={clearSearch}
				class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
				aria-label="Clear search"
			>
				✕
			</button>
		{/if}
	</div>
</div>

