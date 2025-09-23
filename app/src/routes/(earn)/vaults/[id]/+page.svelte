<script lang="ts">
	import { getVaultInfo } from './data.remote';
</script>

<svelte:boundary>
	<div>
		{await getVaultInfo()}
		vault with id
	</div>

	{#snippet pending()}
		loading
	{/snippet}
</svelte:boundary>
