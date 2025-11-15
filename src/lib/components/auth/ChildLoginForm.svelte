<script lang="ts">
	import { childStore } from '$lib/stores/child';
	import { validateUsername } from '$lib/utils/validation';
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';

	let username = '';
	let password = '';
	let error = '';
	let loading = false;

	async function handleSubmit() {
		error = '';
		loading = true;

		// Validate username
		const usernameValidation = validateUsername(username);
		if (!usernameValidation.valid) {
			error = usernameValidation.error || 'Invalid username';
			loading = false;
			return;
		}

		if (!password) {
			error = 'Password is required';
			loading = false;
			return;
		}

		try {
			const response = await fetch('/api/auth/child/login', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ username, password })
			});

			const data = await response.json();

			if (!response.ok) {
				error = data.error || 'Login failed';
				loading = false;
				return;
			}

			// Store child session (cookie for server-side, localStorage for client-side)
			if (browser) {
				if (data.session?.token) {
					localStorage.setItem('child_session', data.session.token);
					document.cookie = `child_session=${data.session.token}; path=/; max-age=${7 * 24 * 60 * 60}`;
				}
			}

			// Update child store
			childStore.setChild(data.child);

			// Redirect based on onboarding status
			if (data.child.onboarding_completed) {
				goto('/child/dashboard');
			} else {
				goto('/onboarding');
			}
		} catch (err) {
			error = 'An unexpected error occurred';
			loading = false;
		}
	}
</script>

<div class="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
	<h2 class="text-2xl font-bold mb-6 text-center">Student Login</h2>

	<form on:submit|preventDefault={handleSubmit} class="space-y-4">
		<div>
			<label for="username" class="block text-sm font-medium text-gray-700 mb-1">
				Username
			</label>
			<input
				id="username"
				type="text"
				bind:value={username}
				required
				class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
				placeholder="Enter your username"
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

	<div class="mt-4 text-center text-sm text-gray-600">
		<p>Forgot your password? Ask your parent to reset it.</p>
	</div>
</div>

