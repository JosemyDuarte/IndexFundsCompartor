<script lang="ts">
	import { setContext } from 'svelte';
	import type { Writable } from 'svelte/store';
	import type { SimulationParams } from '$lib/calculations/simulator';
	import SimulatorForm from './SimulatorForm.svelte';

	export let simulationParams: Writable<SimulationParams>;

	// Provide the store to SimulatorForm via context
	setContext('simulationParams', simulationParams);
</script>

<SimulatorForm />
