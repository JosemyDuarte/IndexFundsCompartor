<script lang="ts">
	interface Props {
		id: string;
		label: string;
		value: number;
		min?: number;
		max?: number;
		step?: number;
		suffix?: string;
		onchange?: (value: number) => void;
	}

	let { id, label, value = $bindable(), min, max, step = 1, suffix, onchange }: Props = $props();

	let inputValue = $state(value.toString());
	let errorMessage = $state('');
	let isFocused = $state(false);
	let hasError = $derived(errorMessage !== '');
	let errorId = $derived(hasError ? `${id}-error` : undefined);

	// Sync with external value changes
	$effect(() => {
		if (!isFocused) {
			inputValue = value.toString();
		}
	});

	function validateValue(val: number): string {
		if (!Number.isFinite(val) || isNaN(val)) {
			return 'Por favor, introduce un número válido';
		}

		if (min !== undefined && val < min) {
			const unit = suffix ? '' : ' año' + (min === 1 ? '' : 's');
			return `El valor mínimo es ${min}${suffix || unit}`;
		}

		if (max !== undefined && val > max) {
			return `El valor máximo es ${max}${suffix || ''}`;
		}

		return '';
	}

	function handleFocus() {
		isFocused = true;
	}

	function handleBlur() {
		isFocused = false;
		const parsed = parseFloat(inputValue);

		errorMessage = validateValue(parsed);

		if (!errorMessage) {
			value = parsed;
			inputValue = parsed.toString();
			onchange?.(parsed);
		}
	}

	function handleInput(event: Event) {
		const target = event.target as HTMLInputElement;
		inputValue = target.value;

		if (isFocused) {
			errorMessage = '';
		}
	}
</script>

<div>
	<label for={id} class="block text-xs font-medium text-neu-text-dark mb-1.5">
		{label}
	</label>

	<div class="relative">
		<input
			{id}
			type="number"
			{min}
			{max}
			{step}
			value={inputValue}
			oninput={handleInput}
			onfocus={handleFocus}
			onblur={handleBlur}
			aria-invalid={hasError}
			aria-describedby={errorId}
			class="w-full px-3 py-2.5 bg-neu-base rounded-lg text-sm text-neu-text
             placeholder-neu-text-light focus:outline-none transition-all duration-200
             {suffix ? 'pr-10' : ''}
             {hasError
				? 'border-2 border-red-500 shadow-red-100'
				: 'shadow-neu-inset focus:shadow-neu-inset-sm'}"
		/>

		{#if suffix}
			<span class="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-neu-text-light">
				{suffix}
			</span>
		{/if}
	</div>

	{#if hasError}
		<p id="{id}-error" class="mt-1 text-xs text-red-600 flex items-center gap-1" role="alert">
			<span class="inline-block w-3 h-3" aria-hidden="true">⚠</span>
			{errorMessage}
		</p>
	{/if}
</div>
