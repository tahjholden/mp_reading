<script lang="ts">
	import { onMount } from 'svelte';
	import ReadingInterestSurvey from './ReadingInterestSurvey.svelte';
	import AvatarCreator from './AvatarCreator.svelte';
	import { childStore } from '$lib/stores/child';
	import { goto } from '$app/navigation';

	let currentStep = 1;
	let surveyData = {
		genres: [] as string[],
		topics: [] as string[],
		formats: [] as string[]
	};
	let avatarData = {
		hair: 'brown',
		eyes: 'blue',
		clothes: 'casual',
		skin: 'medium'
	};
	let loading = false;
	let error = '';

	onMount(() => {
		// Get child ID from store or URL
		if (!$childStore.child) {
			// Try to get from localStorage or redirect
			goto('/login');
		}
	});

	async function completeOnboarding() {
		loading = true;
		error = '';

		if (!$childStore.child) {
			error = 'Child information not found';
			loading = false;
			return;
		}

		try {
			const response = await fetch('/api/onboarding/complete', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					child_id: $childStore.child.id,
					reading_interest_survey: surveyData,
					avatar_choices: avatarData,
					initial_goals: {
						daily_reading_minutes: 20
					}
				})
			});

			const data = await response.json();

			if (!response.ok) {
				error = data.error || 'Failed to complete onboarding';
				loading = false;
				return;
			}

			// Update child store
			childStore.updateChild({ onboarding_completed: true });

			// Redirect to dashboard
			goto('/child/dashboard');
		} catch (err) {
			error = 'An unexpected error occurred';
			loading = false;
		}
	}

	function nextStep() {
		if (currentStep < 3) {
			currentStep++;
		}
	}

	function previousStep() {
		if (currentStep > 1) {
			currentStep--;
		}
	}
</script>

<div class="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
	<h2 class="text-2xl font-bold mb-6 text-center">Welcome! Let's Get Started</h2>

	<!-- Progress indicator -->
	<div class="mb-6">
		<div class="flex justify-between mb-2">
			<span class="text-sm text-gray-600">Step {currentStep} of 3</span>
		</div>
		<div class="w-full bg-gray-200 rounded-full h-2">
			<div
				class="bg-blue-600 h-2 rounded-full transition-all"
				style="width: {(currentStep / 3) * 100}%"
			></div>
		</div>
	</div>

	<!-- Step content -->
	{#if currentStep === 1}
		<div>
			<h3 class="text-xl font-semibold mb-4">Tell us about your reading interests</h3>
			<ReadingInterestSurvey bind:surveyData />
		</div>
	{:else if currentStep === 2}
		<div>
			<h3 class="text-xl font-semibold mb-4">Create your avatar</h3>
			<AvatarCreator bind:avatarData />
		</div>
	{:else if currentStep === 3}
		<div>
			<h3 class="text-xl font-semibold mb-4">Review and Complete</h3>
			<div class="space-y-4">
				<div>
					<h4 class="font-medium mb-2">Your Interests:</h4>
					<p class="text-sm text-gray-600">
						Genres: {surveyData.genres.join(', ') || 'None selected'}<br />
						Topics: {surveyData.topics.join(', ') || 'None selected'}<br />
						Formats: {surveyData.formats.join(', ') || 'None selected'}
					</p>
				</div>
				<div>
					<h4 class="font-medium mb-2">Your Avatar:</h4>
					<p class="text-sm text-gray-600">
						Hair: {avatarData.hair}, Eyes: {avatarData.eyes}, Style: {avatarData.clothes}
					</p>
				</div>
			</div>
		</div>
	{/if}

	{#if error}
		<div class="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
			{error}
		</div>
	{/if}

	<!-- Navigation buttons -->
	<div class="mt-6 flex justify-between">
		{#if currentStep > 1}
			<button
				type="button"
				on:click={previousStep}
				class="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
			>
				Previous
			</button>
		{:else}
			<div></div>
		{/if}

		{#if currentStep < 3}
			<button
				type="button"
				on:click={nextStep}
				class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
			>
				Next
			</button>
		{:else}
			<button
				type="button"
				on:click={completeOnboarding}
				disabled={loading}
				class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
			>
				{loading ? 'Completing...' : 'Complete Onboarding'}
			</button>
		{/if}
	</div>
</div>

