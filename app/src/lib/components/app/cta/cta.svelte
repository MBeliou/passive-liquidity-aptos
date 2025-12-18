<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Card from '$lib/components/ui/card';
	import ArrowRight from '@lucide/svelte/icons/arrow-right';

	let {
		title = 'Stop missing out on liquidity fees',
		description = "The average LP missed out on up to 70% of trading fees. This shouldn' be so hard",
		buttonText = 'Manage my liquidity',
		href = '#'
	}: {
		title?: string;
		description?: string;
		buttonText?: string;
		href?: string;
	} = $props();
</script>

<Card.Root class="from-primary/5 to-primary/10 border-primary/20 bg-gradient-to-br">
	<Card.Content class="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
		<div class="flex items-start gap-4">
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
