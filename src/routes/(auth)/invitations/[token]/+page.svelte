<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';

	let token = '';
	let email = '';
	let password = '';
	let confirmPassword = '';
	let error = '';
	let loading = false;
	let invitationData: any = null;
	let needsAccount = false;
	let checkingInvitation = true;

	onMount(() => {
		token = $page.params.token || '';
		if (!token) {
			error = 'Invalid invitation link';
			checkingInvitation = false;
			return;
		}
		checkInvitation();
	});

	async function checkInvitation() {
		try {
			// In a real app, you'd fetch invitation details to show child name, etc.
			// For now, we'll just check if it's valid when accepting
			checkingInvitation = false;
		} catch (err) {
			error = 'Failed to load invitation';
			checkingInvitation = false;
		}
	}

	async function handleAccept() {
		error = '';
		loading = true;

		// Validate inputs
		if (!email) {
			error = 'Email is required';
			loading = false;
			return;
		}

		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) {
			error = 'Please enter a valid email address';
			loading = false;
			return;
		}

		if (needsAccount) {
			if (!password) {
				error = 'Password is required';
				loading = false;
				return;
			}

			if (password.length < 8) {
				error = 'Password must be at least 8 characters';
				loading = false;
				return;
			}

			if (password !== confirmPassword) {
				error = 'Passwords do not match';
				loading = false;
				return;
			}
		}

		try {
			const response = await fetch(`/api/parents/invitations/${token}/accept`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					email,
					password: needsAccount ? password : undefined
				})
			});

			const data = await response.json();

			if (!response.ok) {
				if (data.error?.includes('account') || data.error?.includes('Email')) {
					needsAccount = true;
					error = data.error || 'Please create an account to accept this invitation';
				} else {
					error = data.error || 'Failed to accept invitation';
				}
				loading = false;
				return;
			}

			// Success - redirect to login or dashboard
			alert('Invitation accepted! Please log in to view the child\'s progress.');
			goto('/login');
		} catch (err) {
			error = 'An unexpected error occurred';
			loading = false;
		}
	}
</script>

<div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
	<div class="max-w-md w-full space-y-8">
		<div>
			<h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
				Accept Parent Invitation
			</h2>
			<p class="mt-2 text-center text-sm text-gray-600">
				You've been invited to view a child's reading progress
			</p>
		</div>

		{#if checkingInvitation}
			<div class="text-center py-8">
				<p class="text-gray-500">Loading invitation...</p>
			</div>
		{:else}
			<form on:submit|preventDefault={handleAccept} class="mt-8 space-y-6 bg-white p-8 rounded-lg shadow">
				<div>
					<label for="email" class="block text-sm font-medium text-gray-700 mb-1">
						Email Address *
					</label>
					<input
						id="email"
						type="email"
						bind:value={email}
						required
						class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
						placeholder="your@email.com"
					/>
					<p class="mt-1 text-xs text-gray-500">
						This must match the email address the invitation was sent to
					</p>
				</div>

				{#if needsAccount}
					<div>
						<label for="password" class="block text-sm font-medium text-gray-700 mb-1">
							Password *
						</label>
						<input
							id="password"
							type="password"
							bind:value={password}
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

					<p class="text-sm text-gray-600">
						You don't have an account yet. We'll create one for you.
					</p>
				{/if}

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
					{loading ? 'Accepting...' : 'Accept Invitation'}
				</button>
			</form>
		{/if}
	</div>
</div>

