<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	export let childId: string;
	export let childName: string;

	const dispatch = createEventDispatcher();

	let invitedEmail = '';
	let error = '';
	let loading = false;
	let success = false;

	async function handleSubmit() {
		error = '';
		loading = true;
		success = false;

		// Validate email
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(invitedEmail)) {
			error = 'Please enter a valid email address';
			loading = false;
			return;
		}

		try {
			const response = await fetch('/api/parents/invitations', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					child_id: childId,
					invited_email: invitedEmail
				})
			});

			const data = await response.json();

			if (!response.ok) {
				error = data.error || 'Failed to send invitation';
				loading = false;
				return;
			}

			// Success
			success = true;
			invitedEmail = '';
			loading = false;

			// Dispatch event to parent component
			dispatch('invitation-sent', data);
		} catch (err) {
			error = 'An unexpected error occurred';
			loading = false;
		}
	}
</script>

<div class="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
	<h2 class="text-2xl font-bold mb-4">Invite Secondary Parent</h2>
	<p class="text-gray-600 mb-6">
		Invite another parent to view {childName}'s reading progress. They will have read-only access.
	</p>

	{#if success}
		<div class="p-4 bg-green-100 border border-green-400 text-green-700 rounded mb-4">
			Invitation sent successfully! The invited parent will receive an email with instructions.
		</div>
	{/if}

	<form on:submit|preventDefault={handleSubmit} class="space-y-4">
		<div>
			<label for="invitedEmail" class="block text-sm font-medium text-gray-700 mb-1">
				Email Address *
			</label>
			<input
				id="invitedEmail"
				type="email"
				bind:value={invitedEmail}
				required
				class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
				placeholder="parent@example.com"
			/>
			<p class="mt-1 text-xs text-gray-500">
				The invited parent will receive an email with a link to accept the invitation.
			</p>
		</div>

		{#if error}
			<div class="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
				{error}
			</div>
		{/if}

		<div class="flex gap-3">
			<button
				type="submit"
				disabled={loading || success}
				class="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
			>
				{loading ? 'Sending...' : success ? 'Sent!' : 'Send Invitation'}
			</button>
			{#if success}
				<button
					type="button"
					on:click={() => {
						success = false;
						dispatch('close');
					}}
					class="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
				>
					Close
				</button>
			{/if}
		</div>
	</form>
</div>

