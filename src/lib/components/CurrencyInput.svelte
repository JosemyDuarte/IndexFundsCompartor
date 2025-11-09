<script lang="ts">
	import { onDestroy } from 'svelte';
	import type { Writable } from 'svelte/store';
	import { formatCurrencyInput, parseCurrencyInput } from '$lib/utils/currencyInput';

	export let id: string;
	export let label: string;
	export let value: Writable<number>;
	export let min: number = 0;

	let displayValue: string = formatCurrencyInput($value);
	let isFocused = false;
	let errorMessage = '';
	let hasError = false;

	// Update display when store changes externally
	$: if (!isFocused) {
		displayValue = formatCurrencyInput($value);
	}

	$: hasError = errorMessage !== '';

	function validateValue(val: number, rawInput: string): string {
		// Check if input contains only invalid characters (letters, etc)
		// If parsed result is 0 but input wasn't "0", it's likely invalid
		if (val === 0 && rawInput.trim() !== '' && rawInput.trim() !== '0') {
			const hasOnlyInvalidChars = /^[^\d]+$/.test(rawInput.replace(/\./g, ''));
			if (hasOnlyInvalidChars) {
				return 'Please enter a valid number';
			}
		}

		// Check if parsed value is invalid (NaN, Infinity, etc)
		if (!Number.isFinite(val)) {
			return 'Please enter a valid number';
		}

		// Check minimum constraint
		if (val < min) {
			return `Minimum value is €${formatCurrencyInput(min)}`;
		}

		return '';
	}

	function handleInput(event: { currentTarget: HTMLInputElement }) {
		displayValue = event.currentTarget.value;

		// Clear error while typing (give user a chance)
		if (isFocused) {
			errorMessage = '';
		}
	}

	function handleFocus() {
		isFocused = true;
		// Show unformatted value when focused for easier editing
		displayValue = $value.toString();
	}

	function handleBlur() {
		isFocused = false;
		const parsed = parseCurrencyInput(displayValue);

		// Validate the parsed value
		errorMessage = validateValue(parsed, displayValue);

		// Update store only if valid
		if (!errorMessage) {
			value.set(parsed);
			displayValue = formatCurrencyInput(parsed);
		} else {
			// Keep the invalid display value to show what user typed
			// Don't update the store
		}
	}

	// Subscribe to store changes
	const unsubscribe = value.subscribe((val) => {
		if (!isFocused) {
			displayValue = formatCurrencyInput(val);
			errorMessage = validateValue(val, val.toString());
		}
	});

	onDestroy(() => {
		unsubscribe();
	});
</script>

<div class="relative">
	<label for={id} class="block text-xs font-medium text-neu-text-dark mb-1.5">
		{label}
	</label>

	<div class="relative">
		<span class="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-neu-text-light">
			€
		</span>

		<input
			{id}
			type="text"
			inputmode="numeric"
			value={displayValue}
			on:input={handleInput}
			on:focus={handleFocus}
			on:blur={handleBlur}
			class="w-full pl-8 pr-3 py-2.5 bg-neu-base rounded-lg text-sm text-neu-text
			       placeholder-neu-text-light focus:outline-none transition-all duration-200
			       {hasError
					? 'border-2 border-red-500 shadow-red-100'
					: 'shadow-neu-inset focus:shadow-neu-inset-sm'}"
			placeholder="0"
		/>
	</div>

	{#if hasError}
		<p class="mt-1 text-xs text-red-600 flex items-center gap-1">
			<span class="inline-block w-3 h-3">⚠</span>
			{errorMessage}
		</p>
	{/if}
</div>
