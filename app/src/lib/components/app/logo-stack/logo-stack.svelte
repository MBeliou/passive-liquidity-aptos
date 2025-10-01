<script lang="ts" module>
	type TokenLogoInfo = {
		logo: string | null;
	};
</script>

<script lang="ts">
	let { tokenA, tokenB }: { tokenA: TokenLogoInfo; tokenB: TokenLogoInfo } = $props();
</script>

<div class="relative">
	<div
		class="size-8 rounded-full border bg-cover bg-center"
		style="background-image: url({tokenA.logo});"
	></div>
	<div
		class="absolute inset-y-0 left-4 top-2 size-8 rounded-full border bg-cover bg-center"
		style="background-image: url({tokenB.logo});"
	></div>
</div>
