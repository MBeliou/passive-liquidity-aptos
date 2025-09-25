<script lang="ts">
	/*
    What we want:
        - 2 sections, one with assets, the other with vaults I suppose
    */

	import { getVaults, getAssets } from './earn.remote';
</script>

<svelte:boundary>
	<div class="flex min-h-screen flex-col">
		<div class="flex justify-between">
			<h1 class="text-3xl font-bold tracking-wide">Earn</h1>
		</div>
		<div class="flex-1">
			<section>
				<div>
					<h2 class="text-lg font-semibold">Top Pools</h2>
					<p class="text-muted-foreground text-sm">Best performers</p>
				</div>
				<div></div>
			</section>
		</div>
	</div>
</svelte:boundary>
