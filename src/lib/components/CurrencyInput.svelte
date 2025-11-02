<script lang="ts">
	import type { Writable } from 'svelte/store';
	import { formatCurrencyInput, parseCurrencyInput } from '$lib/utils/currencyInput';

	export let id: string;
	export let label: string;
	export let value: Writable<number>;
	export let min: number = 0;
	export let step: number = 100;

	let displayValue: string = formatCurrencyInput($value);
	let isFocused = false;

	// Update display when store changes externally
	$: if (!isFocused) {
		displayValue = formatCurrencyInput($value);
	}

	function handleInput(event: { currentTarget: HTMLInputElement }) {
		const parsed = parseCurrencyInput(event.currentTarget.value);
		value.set(parsed);
	}

	function handleFocus() {
		isFocused = true;
		// Show unformatted value when focused for easier editing
		displayValue = $value.toString();
	}

	function handleBlur() {
		isFocused = false;
		// Format value when focus is lost
		displayValue = formatCurrencyInput($value);
	}
</script>

<div>
	<label for={id} class="block text-xs font-medium text-neu-text-dark mb-1.5">
		{label}
	</label>
	<div class="relative">
		<span class="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-neu-text-light">€</span>
		<input
			{id}
			type="text"
			inputmode="numeric"
			value={displayValue}
			on:input={handleInput}
			on:focus={handleFocus}
			on:blur={handleBlur}
			class="w-full pl-8 pr-3 py-2.5 bg-neu-base shadow-neu-inset rounded-lg text-sm
				text-neu-text placeholder-neu-text-light
				focus:outline-none focus:shadow-neu-inset-sm
				transition-all duration-200"
			{min}
			{step}
		/>
	</div>
</div>
