<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { createClient } from '$lib/supabase/client';

	let newPassword = '';
	let confirmPassword = '';
	let error = '';
	let loading = false;
	let success = false;

	onMount(async () => {
		// Supabase Auth handles the token in the URL hash
		// When user clicks the reset link, Supabase sets a session
		// We just need to verify they have a valid session
		const supabase = createClient();
		const {
			data: { session }
		} = await supabase.auth.getSession();

		if (!session) {
			error = 'Invalid or expired reset link. Please request a new password reset.';
		}
	});

	async function handleSubmit() {
		error = '';
		loading = true;
		success = false;

		// Validate passwords
		if (!newPassword) {
			error = 'Password is required';
			loading = false;
			return;
		}

		if (newPassword.length < 8) {
			error = 'Password must be at least 8 characters';
			loading = false;
			return;
		}

		if (newPassword !== confirmPassword) {
			error = 'Passwords do not match';
			loading = false;
			return;
		}

		try {
			const response = await fetch('/api/auth/parent/reset-password/confirm', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					token: 'session-based', // Token is handled by Supabase session
					new_password: newPassword
				})
			});

			const data = await response.json();

			if (!response.ok) {
				error = data.error || 'Failed to reset password';
				loading = false;
				return;
			}

			// Success
			success = true;
			loading = false;

			// Redirect to login after a moment
			setTimeout(() => {
				goto('/login');
			}, 2000);
		} catch (err) {
			error = 'An unexpected error occurred';
			loading = false;
		}
	}
</script>

<div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
	<div class="max-w-md w-full space-y-8">
		<div>
			<h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">Reset Your Password</h2>
			<p class="mt-2 text-center text-sm text-gray-600">
				Enter your new password below
			</p>
		</div>

		{#if success}
			<div class="p-4 bg-green-100 border border-green-400 text-green-700 rounded">
				<p class="font-semibold">Password reset successfully!</p>
				<p class="text-sm mt-1">Redirecting to login...</p>
			</div>
		{:else}
			<form on:submit|preventDefault={handleSubmit} class="mt-8 space-y-6 bg-white p-8 rounded-lg shadow">
				<div>
					<label for="newPassword" class="block text-sm font-medium text-gray-700 mb-1">
						New Password *
					</label>
					<input
						id="newPassword"
						type="password"
						bind:value={newPassword}
						required
						class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
						placeholder="At least 8 characters"
					/>
				</div>

				<div>
					<label for="confirmPassword" class="block text-sm font-medium text-gray-700 mb-1">
						Confirm Password *
					</label>
					<input
						id="confirmPassword"
						type="password"
						bind:value={confirmPassword}
						required
						class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
						placeholder="Confirm your password"
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
					{loading ? 'Resetting...' : 'Reset Password'}
				</button>
			</form>
		{/if}
	</div>
</div>

