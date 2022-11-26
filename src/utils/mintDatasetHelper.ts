import { PublicKey } from '@solana/web3.js';
import { getCurrentCluster } from 'components/providers/OtcConnectionProvider';
import mintData from 'configs/mints.json';
import { MintDetail } from 'models/MintDetail';
import { TokenInfo } from 'models/TokenInfo';

export function getMints(): MintDetail[] {
	const mintList = mintData.mints as MintDetail[];
	return mintList.filter(({ cluster }) => cluster === getCurrentCluster());
}

export function getMintByPubkey(val: PublicKey | string): MintDetail | undefined {
	return getMints().find(({ pubkey }) => pubkey === (typeof val === 'string' ? val : val.toBase58()));
}

export function getMintByStable(): MintDetail[] {
	return getMints().filter(({ isStable }) => isStable);
}

export function getMintByTitle(symbol: string): MintDetail {
	return getMints().find(({ title }) => title === symbol);
}

// // TODO: TokenInfo and MintDetail overlap, we should merge the two types
// export function getMintFromTokenInfo(token: TokenInfo): MintDetail {
// 	return { cluster: getCurrentCluster(), pubkey: token.address, title: token.symbol };
// }
