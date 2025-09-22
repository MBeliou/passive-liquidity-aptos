<script lang="ts" module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import TabBar, { type TabBarLink } from './tab-bar.svelte';
	import PiggyBank from '@lucide/svelte/icons/piggy-bank';
	// More on how to set up stories at: https://storybook.js.org/docs/writing-stories
	const { Story } = defineMeta({
		title: 'Navigation/Tab Bar',
		component: TabBar,
		tags: ['autodocs'],
		argTypes: {},
		args: {}
	});

	const links: TabBarLink[] = [
		{
			label: 'Vaults',
			icon: PiggyBank,
			url: '#'
		}
	];
</script>

<Story name="Default" args={{ links }} />
