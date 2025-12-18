<script lang="ts">

	import { getPoolsV1 } from '$lib/remote/pools.remote';
    

    const query = getPoolsV1();
</script>



{#if query.error}
	<p>oops!</p>
{:else if query.loading}
	<p>loading...</p>
{:else}
	<ul>

		{#each query.current as curr}
            <li>
                {curr}
            </li>
        {/each}
	</ul>
{/if}
