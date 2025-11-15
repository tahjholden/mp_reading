<script lang="ts">
	import { authStore } from '$lib/stores/auth';
	import { validateEmail } from '$lib/utils/validation';
	import { goto } from '$app/navigation';

	let email = '';
	let password = '';
	let error = '';
	let loading = false;

	async function handleSubmit() {
		error = '';
		loading = true;

		// Validate email
		const emailValidation = validateEmail(email);
		if (!emailValidation.valid) {
			error = emailValidation.error || 'Invalid email';
			loading = false;
			return;
		}

		if (!password) {
			error = 'Password is required';
			loading = false;
			return;
		}

		try {
			const response = await fetch('/api/auth/parent/login', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email, password })
			});

			const data = await response.json();

			if (!response.ok) {
				error = data.error || 'Login failed';
				loading = false;
				return;
			}

			// Update auth store
			await authStore.login(email, password);

			// Redirect to parent dashboard
			goto('/parent/dashboard');
		} catch (err) {
			error = 'An unexpected error occurred';
			loading = false;
		}
	}
</script>

<div class="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
	<h2 class="text-2xl font-bold mb-6 text-center">Parent Login</h2>

	<form on:submit|preventDefault={handleSubmit} class="space-y-4">
		<div>
			<label for="email" class="block text-sm font-medium text-gray-700 mb-1">
				Email
			</label>
			<input
				id="email"
				type="email"
				bind:value={email}
				required
				class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
				placeholder="your@email.com"
			/>
		</div>

		<div>
			<label for="password" class="block text-sm font-medium text-gray-700 mb-1">
				Password
			</label>
			<input
				id="password"
				type="password"
				bind:value={password}
				required
				class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
				placeholder="Enter your password"
			/>
		</div>

		{#if error}
			<div class="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
				{error}
			</div>
		{/if}

		<button
			type="submit"
			disabled={loading}
			class="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
		>
			{loading ? 'Logging in...' : 'Log In'}
		</button>
	</form>

	<div class="mt-4 text-center text-sm">
		<a href="/signup" class="text-blue-600 hover:underline">Don't have an account? Sign up</a>
	</div>
</div>

