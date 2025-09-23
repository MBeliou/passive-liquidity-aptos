import { query } from '$app/server';
import { useTapp } from '$lib/shared/tapp-sdk';

export const getVaultInfo = query(async () => {
	// NOTE: We should already know the relevant pools when querying here
	//TAPP_SDK.Pool.getInfo

	// Get our vault positions.
	/*TAPP_SDK.Position.getPositions({
		userAddr: ''
	});*/

	const tapp = useTapp();
/*
	tapp.Position.getPositions
	const info = await tapp.Position.getPositions({
		userAddr: "0xbc28b9096f1ea3729d499ce4b9c98243ce80aa5b1d9a836f9d8700a1e8db6ff6"
	});

	console.dir(info.data)*/

	const info = await tapp.Pool.getInfo("0xf5840b576a3a6a42464814bc32ae1160c50456fb885c62be389b817e75b2a385");

	console.dir(info)
	return {};
});
