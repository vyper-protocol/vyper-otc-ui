import { Cluster } from '@solana/web3.js';

export const buildHomeUrl = (): string => {
	return '/';
};

export const buildContractSummaryUrl = (contractAddress: string): string => {
	return `/contract/summary/${contractAddress}`;
};

export const buildCreateContractUrl = (): string => {
	return '/contract/create';
};

export const buildExplorerUrl = (): string => {
	return '/explorer';
};

export const buildFeaturedUrl = (): string => {
	return '/featured';
};

export const buildFeaturedContractUrl = (featuredId: string): string => {
	return `/featured/${featuredId}`;
};

export function buildDepositQRCodeUrl(contract: string, isBuyer: boolean): string {
	return `/qr?op=deposit&contract=${contract}&isBuyer=${isBuyer}`;
}

export const buildFullUrl = (cluster: Cluster, path: string): string => {
	return cluster === 'devnet' ? `https://demo.otc.vyperprotocol.io${path}` : `https://otc.vyperprotocol.io${path}`;
};
