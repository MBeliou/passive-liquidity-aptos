<script lang="ts">
	/*
    What we want:
        - 2 sections, one with assets, the other with vaults I suppose
    */

	import { getVaults, getAssets } from './earn.remote';
</script>

<svelte:boundary>
	<div class="flex min-h-screen flex-col">
		<div class="">header with action</div>
		<div class="flex-1">
			<section>
				<div>
					<h2>Assets</h2>
					<p>Assets description</p>
				</div>

				<div>
					{#each await getAssets() as asset}
						<li>
							{asset.name} - {asset.symbol} - {asset.assetType}
						</li>
					{/each}
				</div>
			</section>
		</div>
	</div>
</svelte:boundary>
