<script lang="ts" module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import PoolChart from './pool-chart.svelte';
	import { binLiquidity, type PositionWithFee } from './utils';
	import { positions, midPrice as aptMidPrice } from './data';

	const { Story } = defineMeta({
		title: 'Charts/Pool',
		component: PoolChart,
		tags: ['autodocs'],
		argTypes: {},
		args: {}
	});

	// Mock data for testing binLiquidity
	const midPrice = 1.5;

	// Create mock positions with different ranges and fee tiers
	const mockPositions: PositionWithFee[] = [
		// Full range position with 0.3% fee
		{
			tickLower: -887272,
			tickUpper: 887272,
			liquidity: '10000000',
			fee: 0.3,
			index: 1,
			pool: 'mock-pool',
			updatedAt: new Date()
		},
		// Tight range around midPrice with 0.01% fee
		{
			tickLower: 3000,
			tickUpper: 5000,
			liquidity: '5000000',
			fee: 0.01,
			index: 2,
			pool: 'mock-pool',
			updatedAt: new Date()
		},
		// Medium range with 0.05% fee
		{
			tickLower: 2000,
			tickUpper: 6000,
			liquidity: '3000000',
			fee: 0.05,
			index: 3,
			pool: 'mock-pool',
			updatedAt: new Date()
		},
		// Another position with 1% fee
		{
			tickLower: 3500,
			tickUpper: 4500,
			liquidity: '2000000',
			fee: 1,
			index: 4,
			pool: 'mock-pool',
			updatedAt: new Date()
		}
	];

	const mockBinnedData = binLiquidity(midPrice, mockPositions, { bins: 10, delta: 10 });

	console.log('Mock binned data:', mockBinnedData);

	// Single position that should fit in one bin
	const singleBinPosition: PositionWithFee[] = [
		{
			tickLower: 4100,
			tickUpper: 4150,
			liquidity: '1000000',
			fee: 0.3,
			index: 1,
			pool: 'mock-pool',
			updatedAt: new Date()
		}
	];

	const singleBinData = binLiquidity(midPrice, singleBinPosition, { bins: 10, delta: 10 });
	console.log('Single bin data:', singleBinData);

	// Single position that should span multiple bins equally
	const multipleBinsPosition: PositionWithFee[] = [
		{
			tickLower: 3000,
			tickUpper: 5000,
			liquidity: '1000000',
			fee: 0.3,
			index: 1,
			pool: 'mock-pool',
			updatedAt: new Date()
		}
	];

	const multipleBinsData = binLiquidity(midPrice, multipleBinsPosition, { bins: 10, delta: 20 });

	const apt_usdt_data = binLiquidity(
		aptMidPrice,
		positions.map((p) => ({
			...p,
			tickLower: parseFloat(p.tick_lower),
			tickUpper: parseFloat(p.tick_upper),
			fee: 0.3,
			pool: '',
			updatedAt: new Date(p.updated_at)
		})),
		{ bins: 20, delta: 25 }
	);
</script>

<Story name="Default" />

<Story name="Mock Data Test" args={{ chartData: mockBinnedData }} />

<Story name="Single Bin Position" args={{ chartData: singleBinData }} />

<Story name="Multiple Bins Equal Distribution" args={{ chartData: multipleBinsData }} />

<Story name="Apt USDT data export" args={{ chartData: apt_usdt_data }} />
