/* eslint-disable no-console */
import { PublicKey } from '@solana/web3.js';
import axios from 'axios';
import { TokenInfo } from 'models/TokenInfo';
import useTokenInfoStore from 'store/useTokenInfoStore';

export const fetchTokenInfo = async (mint: PublicKey): Promise<TokenInfo | undefined> => {
	return internalTokenInfoCall({ mint: mint.toBase58() });
};

export const fetchTokenInfoBySymbol = async (symbol: string): Promise<TokenInfo | undefined> => {
	return internalTokenInfoCall({ symbol });
};

const internalTokenInfoCall = async (reqData: { mint?: string; symbol?: string }): Promise<TokenInfo | undefined> => {
	try {
		const axiosRes = await axios.get('/api/token-info', {
			params: reqData
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
	const cachedTokenInfo = useTokenInfoStore.getState().tokenInfos.find((c) => c.address === mint.toBase58());
	if (cachedTokenInfo) {
		console.log('return cached token info');
		return cachedTokenInfo;
	}

	const freshTokenInfo = await fetchTokenInfo(mint);
	if (freshTokenInfo) {
		console.log('caching fresh token info');
		useTokenInfoStore.getState().addTokenInfo(freshTokenInfo);
	}
	return freshTokenInfo;
};

export const fetchTokenInfoBySymbolCached = async (symbol: string): Promise<TokenInfo | undefined> => {
	const cachedTokenInfo = useTokenInfoStore.getState().tokenInfos.find((c) => c.symbol === symbol);
	if (cachedTokenInfo) {
		console.log('return cached token info');
		return cachedTokenInfo;
	}

	const freshTokenInfo = await fetchTokenInfoBySymbol(symbol);
	if (freshTokenInfo) {
		console.log('caching fresh token info');
		useTokenInfoStore.getState().addTokenInfo(freshTokenInfo);
	}
	return freshTokenInfo;
};
