<script lang="ts">
	import LoginForm from '$lib/components/auth/LoginForm.svelte';
	import ChildLoginForm from '$lib/components/auth/ChildLoginForm.svelte';

	let userType: 'parent' | 'child' = 'parent';
</script>

<div class="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
	<div class="w-full max-w-md">
		<div class="mb-6 text-center">
			<h1 class="text-3xl font-bold text-gray-900">Reading App</h1>
			<p class="mt-2 text-sm text-gray-600">Welcome back!</p>
		</div>

		<!-- User Type Toggle -->
		<div class="mb-6 flex justify-center space-x-4">
			<button
				type="button"
				on:click={() => (userType = 'parent')}
				class="px-4 py-2 rounded-md {userType === 'parent'
					? 'bg-blue-600 text-white'
					: 'bg-gray-200 text-gray-700 hover:bg-gray-300'}"
			>
				Parent
			</button>
			<button
				type="button"
				on:click={() => (userType = 'child')}
				class="px-4 py-2 rounded-md {userType === 'child'
					? 'bg-blue-600 text-white'
					: 'bg-gray-200 text-gray-700 hover:bg-gray-300'}"
			>
				Student
			</button>
		</div>

		{#if userType === 'parent'}
			<LoginForm />
		{:else}
			<ChildLoginForm />
		{/if}
	</div>
</div>

