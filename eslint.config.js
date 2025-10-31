import js from '@eslint/js';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import sveltePlugin from 'eslint-plugin-svelte';
import svelteParser from 'svelte-eslint-parser';

export default [
	js.configs.recommended,
	{
		files: ['**/*.ts', '**/*.js'],
		languageOptions: {
			parser: tsParser,
			ecmaVersion: 2020,
			sourceType: 'module',
			globals: {
				console: 'readonly',
				process: 'readonly',
				__dirname: 'readonly',
				Buffer: 'readonly',
				window: 'readonly',
				document: 'readonly',
				HTMLInputElement: 'readonly',
				HTMLCanvasElement: 'readonly',
				URLSearchParams: 'readonly'
			}
		},
		plugins: {
			'@typescript-eslint': tsPlugin
		},
		rules: {
			...tsPlugin.configs.recommended.rules
		}
	},
	...sveltePlugin.configs['flat/recommended'],
	{
		files: ['**/*.svelte'],
		languageOptions: {
			parser: svelteParser,
			parserOptions: {
				parser: tsParser
			},
			globals: {
				window: 'readonly',
				document: 'readonly',
				HTMLInputElement: 'readonly',
				HTMLCanvasElement: 'readonly',
				URLSearchParams: 'readonly'
			}
		}
	},
	{
		ignores: ['.svelte-kit/**', 'build/**', 'node_modules/**', 'package-lock.json', 'dist/**']
	}
];
