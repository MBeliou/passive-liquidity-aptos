<script lang="ts" module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import CTA from './cta.svelte';

	const { Story } = defineMeta({
		title: 'Components/CTA',
		component: CTA,
		tags: ['autodocs'],
		argTypes: {},
		args: {}
	});
</script>

<Story name="Default" />

<Story
	name="Custom Text"
	args={{
		title: 'Start Earning Today',
		description: 'Connect your wallet and start providing liquidity to earn trading fees.',
		buttonText: 'Get Started'
	}}
/>

<Story
	name="Profile CTA"
	args={{
		title: 'Manage Your Liquidity',
		description: 'View and manage your positions, track performance, and optimize your returns.',
		buttonText: 'Go to Profile',
		href: '/profile'
	}}
/>
