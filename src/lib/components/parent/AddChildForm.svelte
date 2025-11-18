<script lang="ts">
	import { parentStore } from '$lib/stores/parent';
	import { validateChildName, validateAge, validateGradeLevel, validateUsername, validatePassword } from '$lib/utils/validation';

	let name = '';
	let age = 10;
	let gradeLevel = 5;
	let username = '';
	let password = '';
	let email = '';
	let error = '';
	let loading = false;

	const gradeOptions = [4, 5, 6];
	const ageOptions = [9, 10, 11, 12];

	async function handleSubmit() {
		error = '';
		loading = true;

		// Validate all fields
		const nameValidation = validateChildName(name);
		if (!nameValidation.valid) {
			error = nameValidation.error || 'Invalid name';
			loading = false;
			return;
		}

		const ageValidation = validateAge(age);
		if (!ageValidation.valid) {
			error = ageValidation.error || 'Invalid age';
			loading = false;
			return;
		}

		const gradeValidation = validateGradeLevel(gradeLevel);
		if (!gradeValidation.valid) {
			error = gradeValidation.error || 'Invalid grade level';
			loading = false;
			return;
		}

		const usernameValidation = validateUsername(username);
		if (!usernameValidation.valid) {
			error = usernameValidation.error || 'Invalid username';
			loading = false;
			return;
		}

		const passwordValidation = validatePassword(password);
		if (!passwordValidation.valid) {
			error = passwordValidation.error || 'Invalid password';
			loading = false;
			return;
		}

		try {
			const response = await fetch('/api/parents/children', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					name,
					age,
					grade_level: gradeLevel,
					username,
					password,
					email: email || undefined
				})
			});

			const data = await response.json();

			if (!response.ok) {
				error = data.error || 'Failed to create child profile';
				loading = false;
				return;
			}

			// Add child to store
			parentStore.addChild(data);

			// Reset form
			name = '';
			age = 10;
			gradeLevel = 5;
			username = '';
			password = '';
			email = '';

			// Show success message or redirect
			alert('Child profile created successfully!');
		} catch (err) {
			error = 'An unexpected error occurred';
			loading = false;
		}
	}
</script>

<div class="max-w-md mx-auto p-4 sm:p-6 bg-white rounded-lg shadow-md">
	<h2 class="text-2xl font-bold mb-6">Add Your Child</h2>

	<form on:submit|preventDefault={handleSubmit} class="space-y-4">
		<div>
			<label for="name" class="block text-sm font-medium text-gray-700 mb-1">
				Child's Name *
			</label>
			<input
				id="name"
				type="text"
				bind:value={name}
				required
				autocomplete="name"
				aria-required="true"
				aria-invalid={error ? 'true' : 'false'}
				aria-describedby={error ? 'error-message' : undefined}
				class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
				placeholder="Enter child's name"
			/>
		</div>

		<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
			<div>
				<label for="age" class="block text-sm font-medium text-gray-700 mb-1">
					Age *
				</label>
				<select
					id="age"
					bind:value={age}
					required
					class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
				>
					{#each ageOptions as option}
						<option value={option}>{option}</option>
					{/each}
				</select>
			</div>

			<div>
				<label for="gradeLevel" class="block text-sm font-medium text-gray-700 mb-1">
					Grade Level *
				</label>
				<select
					id="gradeLevel"
					bind:value={gradeLevel}
					required
					class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
				>
					{#each gradeOptions as option}
						<option value={option}>Grade {option}</option>
					{/each}
				</select>
			</div>
		</div>

		<div>
			<label for="username" class="block text-sm font-medium text-gray-700 mb-1">
				Username *
			</label>
			<input
				id="username"
				type="text"
				bind:value={username}
				required
				class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
				placeholder="3-20 characters, letters, numbers, underscores"
			/>
			<p class="mt-1 text-xs text-gray-500">Your child will use this to log in</p>
		</div>

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
			<label for="email" class="block text-sm font-medium text-gray-700 mb-1">
				Email (Optional)
			</label>
			<input
				id="email"
				type="email"
				bind:value={email}
				class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
				placeholder="child@email.com or your email"
			/>
			<p class="mt-1 text-xs text-gray-500">Can be your email or your child's email</p>
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
			{loading ? 'Creating profile...' : 'Add Child'}
		</button>
	</form>
</div>

