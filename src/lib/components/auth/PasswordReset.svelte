<script lang="ts">
	import { goto } from '$app/navigation';

	let email = '';
	let error = '';
	let loading = false;
	let success = false;

	async function handleSubmit() {
		error = '';
		loading = true;
		success = false;

		// Validate email
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) {
			error = 'Please enter a valid email address';
			loading = false;
			return;
		}

		try {
			const response = await fetch('/api/auth/parent/reset-password', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email })
			});

			const data = await response.json();

			if (!response.ok) {
				error = data.error || 'Failed to send reset email';
				loading = false;
				return;
			}

			// Success
			success = true;
			loading = false;
		} catch (err) {
			error = 'An unexpected error occurred';
			loading = false;
		}
	}
</script>

<div class="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
	<h2 class="text-2xl font-bold mb-4">Reset Password</h2>
	<p class="text-gray-600 mb-6">
		Enter your email address and we'll send you a link to reset your password.
	</p>

	{#if success}
		<div class="p-4 bg-green-100 border border-green-400 text-green-700 rounded mb-4">
			<p class="font-semibold">Check your email!</p>
			<p class="text-sm mt-1">
				If an account exists with that email, we've sent a password reset link. Please check your inbox
				and follow the instructions.
			</p>
		</div>
	{/if}

	<form on:submit|preventDefault={handleSubmit} class="space-y-4">
		<div>
			<label for="email" class="block text-sm font-medium text-gray-700 mb-1">
				Email Address *
			</label>
			<input
				id="email"
				type="email"
				bind:value={email}
				required
				disabled={success}
				class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
				placeholder="your@email.com"
			/>
		</div>

		{#if error}
			<div class="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
				{error}
			</div>
		{/if}

		<button
			type="submit"
			disabled={loading || success}
			class="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
		>
			{loading ? 'Sending...' : success ? 'Email Sent!' : 'Send Reset Link'}
		</button>

		<div class="text-center mt-4">
			<button
				type="button"
				on:click={() => goto('/login')}
				class="text-sm text-blue-600 hover:text-blue-800"
			>
				Back to Login
			</button>
		</div>
	</form>
</div>

