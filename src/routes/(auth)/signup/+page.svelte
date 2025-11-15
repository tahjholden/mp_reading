<script lang="ts">
	import SignupForm from '$lib/components/auth/SignupForm.svelte';
	import SocialLogin from '$lib/components/auth/SocialLogin.svelte';
</script>

<div class="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
	<div class="w-full max-w-md">
		<div class="mb-6 text-center">
			<h1 class="text-3xl font-bold text-gray-900">Reading App</h1>
			<p class="mt-2 text-sm text-gray-600">Create your parent account to get started</p>
		</div>

		<SocialLogin />
		
		<div class="my-6 flex items-center">
			<div class="flex-1 border-t border-gray-300"></div>
			<span class="px-4 text-sm text-gray-500">or</span>
			<div class="flex-1 border-t border-gray-300"></div>
		</div>

		<SignupForm />
	</div>
</div>

