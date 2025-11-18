<script lang="ts">
	interface Props {
		surveyData?: {
			genres?: string[];
			topics?: string[];
			formats?: string[];
		};
	}

	const defaultSurveyData = $state({
		genres: [] as string[],
		topics: [] as string[],
		formats: [] as string[]
	});

	const { surveyData = $bindable(defaultSurveyData) } = $props<Props>();

	const genres = [
		'Fantasy',
		'Adventure',
		'Mystery',
		'Science Fiction',
		'Historical Fiction',
		'Realistic Fiction',
		'Non-Fiction',
		'Biography',
		'Poetry',
		'Graphic Novels'
	];

	const topics = [
		'Animals',
		'Space',
		'Sports',
		'Music',
		'Art',
		'Nature',
		'Friendship',
		'Family',
		'Magic',
		'History',
		'Technology',
		'Cooking'
	];

	const formats = ['Books', 'Audiobooks', 'E-books', 'Comics'];

	function toggleGenre(genre: string) {
		if (surveyData.genres.includes(genre)) {
			surveyData.genres = surveyData.genres.filter((g) => g !== genre);
		} else {
			surveyData.genres = [...surveyData.genres, genre];
		}
	}

	function toggleTopic(topic: string) {
		if (surveyData.topics.includes(topic)) {
			surveyData.topics = surveyData.topics.filter((t) => t !== topic);
		} else {
			surveyData.topics = [...surveyData.topics, topic];
		}
	}

	function toggleFormat(format: string) {
		if (surveyData.formats.includes(format))	{
			surveyData.formats = surveyData.formats.filter((f) => f !== format);
		} else {
			surveyData.formats = [...surveyData.formats, format];
		}
	}
</script>

<div class="space-y-6">
	<div role="group" aria-labelledby="genres-heading">
		<h3 id="genres-heading" class="text-lg font-semibold mb-3">What genres do you like? (Select all that apply)</h3>
		<div class="grid grid-cols-2 md:grid-cols-3 gap-2">
			{#each genres as genre}
				<button
					type="button"
					on:click={() => toggleGenre(genre)}
					aria-pressed={surveyData.genres.includes(genre)}
					aria-label="Select genre: {genre}"
					class="px-4 py-2 rounded-md border-2 {surveyData.genres.includes(genre)
						? 'bg-blue-600 text-white border-blue-600'
						: 'bg-white text-gray-700 border-gray-300 hover:border-blue-500'} focus:outline-none focus:ring-2 focus:ring-blue-500"
				>
					{genre}
				</button>
			{/each}
		</div>
	</div>

	<div role="group" aria-labelledby="topics-heading">
		<h3 id="topics-heading" class="text-lg font-semibold mb-3">What topics interest you? (Select all that apply)</h3>
		<div class="grid grid-cols-2 md:grid-cols-3 gap-2">
			{#each topics as topic}
				<button
					type="button"
					on:click={() => toggleTopic(topic)}
					aria-pressed={surveyData.topics.includes(topic)}
					aria-label="Select topic: {topic}"
					class="px-4 py-2 rounded-md border-2 {surveyData.topics.includes(topic)
						? 'bg-blue-600 text-white border-blue-600'
						: 'bg-white text-gray-700 border-gray-300 hover:border-blue-500'} focus:outline-none focus:ring-2 focus:ring-blue-500"
				>
					{topic}
				</button>
			{/each}
		</div>
	</div>

	<div role="group" aria-labelledby="formats-heading">
		<h3 id="formats-heading" class="text-lg font-semibold mb-3">What formats do you prefer? (Select all that apply)</h3>
		<div class="grid grid-cols-2 md:grid-cols-4 gap-2">
			{#each formats as format}
				<button
					type="button"
					on:click={() => toggleFormat(format)}
					aria-pressed={surveyData.formats.includes(format)}
					aria-label="Select format: {format}"
					class="px-4 py-2 rounded-md border-2 {surveyData.formats.includes(format)
						? 'bg-blue-600 text-white border-blue-600'
						: 'bg-white text-gray-700 border-gray-300 hover:border-blue-500'} focus:outline-none focus:ring-2 focus:ring-blue-500"
				>
					{format}
				</button>
			{/each}
		</div>
	</div>
</div>

