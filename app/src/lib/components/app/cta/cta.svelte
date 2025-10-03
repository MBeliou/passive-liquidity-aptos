<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Card from '$lib/components/ui/card';
	import UserRound from '@lucide/svelte/icons/user-round';
	import ArrowRight from '@lucide/svelte/icons/arrow-right';

	let {
		title = 'Manage Your Liquidity',
		description = 'View and manage your positions, track performance, and optimize your returns.',
		buttonText = 'Go to Profile',
		href = '/profile'
	}: {
		title?: string;
		description?: string;
		buttonText?: string;
		href?: string;
	} = $props();
</script>

<Card.Root class="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
	<Card.Content class="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
		<div class="flex items-start gap-4">
			<div class="bg-primary/10 text-primary rounded-full p-3">
				<UserRound class="size-6" />
			</div>
			<div class="flex-1">
				<h3 class="text-lg font-semibold">{title}</h3>
				<p class="text-muted-foreground mt-1 text-sm">
					{description}
				</p>
			</div>
		</div>
		<Button {href} class="md:shrink-0">
			{buttonText}
			<ArrowRight class="ml-2 size-4" />
		</Button>
	</Card.Content>
</Card.Root>
