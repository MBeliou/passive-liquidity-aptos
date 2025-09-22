<script lang="ts" module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import TabBar from './tab-bar.svelte';

	// More on how to set up stories at: https://storybook.js.org/docs/writing-stories
	const { Story } = defineMeta({
		title: 'Navigation/Tab Bar',
		component: TabBar,
		tags: ['autodocs'],
		argTypes: {},
		args: {}
	});
</script>

<Story name="Default" />
