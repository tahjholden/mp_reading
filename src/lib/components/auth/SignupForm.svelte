<script lang="ts">
	import { authStore } from '$lib/stores/auth';
	import { validateEmail, validatePassword } from '$lib/utils/validation';
	import { goto } from '$app/navigation';

	let email = '';
	let password = '';
	let confirmPassword = '';
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

		// Validate password
		const passwordValidation = validatePassword(password);
		if (!passwordValidation.valid) {
			error = passwordValidation.error || 'Invalid password';
			loading = false;
			return;
		}

		// Check password confirmation
		if (password !== confirmPassword) {
			error = 'Passwords do not match';
			loading = false;
			return;
		}

		try {
			const response = await fetch('/api/auth/parent/signup', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email, password })
			});

			const data = await response.json();

			if (!response.ok) {
				error = data.error || 'Signup failed';
				loading = false;
				return;
			}

			// Update auth store
			if (data.session) {
				await authStore.login(email, password);
			}

			// Redirect to parent dashboard
			goto('/parent/dashboard');
		} catch (err) {
			error = 'An unexpected error occurred';
			loading = false;
		}
	}
</script>

<div class="max-w-md mx-auto mt-4 sm:mt-8 p-4 sm:p-6 bg-white rounded-lg shadow-md">
	<h2 class="text-2xl font-bold mb-6 text-center">Create Parent Account</h2>

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
				autocomplete="email"
				aria-required="true"
				aria-invalid={error ? 'true' : 'false'}
				aria-describedby={error ? 'error-message' : undefined}
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
				autocomplete="new-password"
				aria-required="true"
				aria-invalid={error ? 'true' : 'false'}
				aria-describedby={error ? 'error-message' : 'password-hint'}
				class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
				placeholder="At least 8 characters"
			/>
			<p id="password-hint" class="mt-1 text-xs text-gray-500" aria-live="polite">
				Must be at least 8 characters long
			</p>
		</div>

		<div>
			<label for="confirmPassword" class="block text-sm font-medium text-gray-700 mb-1">
				Confirm Password
			</label>
			<input
				id="confirmPassword"
				type="password"
				bind:value={confirmPassword}
				required
				autocomplete="new-password"
				aria-required="true"
				aria-invalid={error ? 'true' : 'false'}
				aria-describedby={error ? 'error-message' : undefined}
				class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
				placeholder="Confirm your password"
			/>
		</div>

		{#if error}
			<div id="error-message" class="p-3 bg-red-100 border border-red-400 text-red-700 rounded" role="alert" aria-live="assertive">
				{error}
			</div>
		{/if}

		<button
			type="submit"
			disabled={loading}
			aria-busy={loading}
			aria-disabled={loading}
			class="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
		>
			{loading ? 'Creating account...' : 'Sign Up'}
		</button>
	</form>

	<div class="mt-4 text-center text-sm">
		<a href="/login" class="text-blue-600 hover:underline">Already have an account? Log in</a>
	</div>
</div>

