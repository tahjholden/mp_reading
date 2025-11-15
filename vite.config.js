import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';
import { loadEnv } from 'vite';
import { readFileSync } from 'fs';
import { resolve } from 'path';

export default defineConfig(({ mode }) => {
	// Load env vars from .env file
	const env = loadEnv(mode, process.cwd(), '');
	
	// Also try to load .env directly for tests
	try {
		const envFile = readFileSync(resolve(process.cwd(), '.env'), 'utf-8');
		envFile.split('\n').forEach(line => {
			const match = line.match(/^([^#=]+)=(.*)$/);
			if (match) {
				const key = match[1].trim();
				const value = match[2].trim().replace(/^["']|["']$/g, '');
				if (!env[key]) {
					env[key] = value;
				}
			}
		});
	} catch (e) {
		// .env file might not exist, that's okay
	}
	
	return {
		plugins: [sveltekit()],
		test: {
			include: ['src/**/*.{test,spec}.{js,ts}', 'tests/**/*.{test,spec}.{js,ts}'],
			environment: 'node',
			globals: true,
			env: {
				PUBLIC_SUPABASE_URL: env.PUBLIC_SUPABASE_URL || process.env.PUBLIC_SUPABASE_URL || '',
				PUBLIC_SUPABASE_ANON_KEY: env.PUBLIC_SUPABASE_ANON_KEY || process.env.PUBLIC_SUPABASE_ANON_KEY || ''
			}
		}
	};
});

