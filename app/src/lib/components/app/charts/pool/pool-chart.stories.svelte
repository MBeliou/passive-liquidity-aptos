<script lang="ts" module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import PoolChart from './pool-chart.svelte';

	const { Story } = defineMeta({
		title: 'Charts/Pool',
		component: PoolChart,
		tags: ['autodocs'],
		argTypes: {},
		args: {}
	});
</script>

<Story name="Default" />
