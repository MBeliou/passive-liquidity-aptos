<script lang="ts">
	import { getTappPools } from './data.remote';

</script>

<svelte:boundary>
	<div>
		{#each Object.entries(await getTappPools()) as [symbols, pools]}
			<div>
				<h3>
					{symbols}
				</h3>
			</div>
			{#each pools as pool, i}
				{@const from = pool.tokens.at(0)}
				{@const to = pool.tokens.at(1)}

				<div class="flex items-center gap-2">
					<div class="">
						#{i}
					</div>
					<div>
						<div>
							{from?.symbol} - {to?.symbol}
						</div>
						{pool.feeTier} - {pool.apr?.boostedAprPercentage}
					</div>
				</div>
			{/each}
		{/each}
	</div>

	{#snippet pending()}
		<p>loading...</p>
	{/snippet}
</svelte:boundary>
