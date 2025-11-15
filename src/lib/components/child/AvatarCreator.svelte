<script lang="ts">
	export let avatarData = $state({
		hair: 'brown',
		eyes: 'blue',
		clothes: 'casual',
		skin: 'medium'
	});

	const hairOptions = ['black', 'brown', 'blonde', 'red', 'blue', 'green'];
	const eyeOptions = ['brown', 'blue', 'green', 'hazel', 'gray'];
	const clothesOptions = ['casual', 'sporty', 'formal', 'fun'];
	const skinOptions = ['light', 'medium', 'dark'];

	function updateAvatar(part: string, value: string) {
		avatarData = { ...avatarData, [part]: value };
	}
</script>

<div class="space-y-6">
	<div class="flex justify-center">
		<div class="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center border-4 border-gray-300">
			<!-- Simple avatar preview -->
			<div class="text-6xl">👤</div>
		</div>
	</div>

	<div>
		<label class="block text-sm font-medium text-gray-700 mb-2">Hair Color</label>
		<div class="grid grid-cols-3 gap-2">
			{#each hairOptions as option}
				<button
					type="button"
					on:click={() => updateAvatar('hair', option)}
					class="px-4 py-2 rounded-md border-2 {avatarData.hair === option
						? 'bg-blue-600 text-white border-blue-600'
						: 'bg-white text-gray-700 border-gray-300 hover:border-blue-500'}"
				>
					{option}
				</button>
			{/each}
		</div>
	</div>

	<div>
		<label class="block text-sm font-medium text-gray-700 mb-2">Eye Color</label>
		<div class="grid grid-cols-3 gap-2">
			{#each eyeOptions as option}
				<button
					type="button"
					on:click={() => updateAvatar('eyes', option)}
					class="px-4 py-2 rounded-md border-2 {avatarData.eyes === option
						? 'bg-blue-600 text-white border-blue-600'
						: 'bg-white text-gray-700 border-gray-300 hover:border-blue-500'}"
				>
					{option}
				</button>
			{/each}
		</div>
	</div>

	<div>
		<label class="block text-sm font-medium text-gray-700 mb-2">Clothing Style</label>
		<div class="grid grid-cols-2 gap-2">
			{#each clothesOptions as option}
				<button
					type="button"
					on:click={() => updateAvatar('clothes', option)}
					class="px-4 py-2 rounded-md border-2 {avatarData.clothes === option
						? 'bg-blue-600 text-white border-blue-600'
						: 'bg-white text-gray-700 border-gray-300 hover:border-blue-500'}"
				>
					{option}
				</button>
			{/each}
		</div>
	</div>
</div>

