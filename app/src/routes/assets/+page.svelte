<script lang="ts">
	import { searchTokens } from "$lib/components/app/search-panel/data.remote";


</script>

{#each await searchTokens(undefined) as token}
    <div>
        {token.name} - {token.address}
    </div>

{/each}
