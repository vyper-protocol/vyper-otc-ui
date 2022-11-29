/* eslint-disable no-console */
import { PublicKey } from '@solana/web3.js';
import axios from 'axios';
import { TokenInfo } from 'models/TokenInfo';
import useTokenInfoStore from 'store/useTokenInfoStore';

export const fetchTokenInfo = async (mint: PublicKey): Promise<TokenInfo | undefined> => {
	console.log('calling api endpoint, for mint: ' + mint);

	try {
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
	} catch (err) {
		console.error(err);
		return undefined;
	}
};

export const fetchTokenInfoCached = async (mint: PublicKey): Promise<TokenInfo | undefined> => {
	console.log('request token info ' + mint);
	const cachedTokenInfo = useTokenInfoStore.getState().tokenInfos.find((c) => c.address === mint.toBase58());
	if (cachedTokenInfo) {
		console.log('return cached token info');
		return cachedTokenInfo;
	}

	console.log('fetching fresh token info');
	const freshTokenInfo = await fetchTokenInfo(mint);
	if (freshTokenInfo) {
		console.log('caching fresh token info');
		useTokenInfoStore.getState().addTokenInfo(freshTokenInfo);
	}
	return freshTokenInfo;
};
