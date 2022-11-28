import { PublicKey } from '@solana/web3.js';
import { getCurrentCluster } from 'components/providers/OtcConnectionProvider';
import mintData from 'configs/mints.json';
import { MintDetail } from 'models/MintDetail';

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
