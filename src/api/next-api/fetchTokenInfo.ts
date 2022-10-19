/* eslint-disable no-console */
import { PublicKey } from '@solana/web3.js';
import axios from 'axios';
import { TokenInfo } from 'models/TokenInfo';

export const fetchTokenInfo = async (mint: PublicKey): Promise<TokenInfo | undefined> => {
	console.log('calling api endpoint, for mint: ' + mint);

	const axiosRes = await axios.get('/api/token-info', {
		params: {
			mint: mint.toBase58()
		}
	});

	if (axiosRes.status === 200) {
		return axiosRes.data;
	} else {
		console.warn(axiosRes);
		return undefined;
	}
};
