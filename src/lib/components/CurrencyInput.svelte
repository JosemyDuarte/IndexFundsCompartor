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

	function handleInput(event: Event) {
		const target = event.target as HTMLInputElement;
		const parsed = parseCurrencyInput(target.value);
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
	<label for={id} class="block text-sm font-medium text-gray-200 mb-2">
		{label}
	</label>
	<div class="relative">
		<span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">€</span>
		<input
			{id}
			type="text"
			inputmode="numeric"
			value={displayValue}
			on:input={handleInput}
			on:focus={handleFocus}
			on:blur={handleBlur}
			class="w-full pl-8 pr-3 py-3 bg-white/5 border border-white/10 rounded-xl
				text-white placeholder-gray-500
				focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
				transition-all duration-200"
			{min}
			{step}
		/>
	</div>
</div>
