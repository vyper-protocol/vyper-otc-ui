import { Cluster } from '@solana/web3.js';

export type MintDetail = {
	cluster: Cluster;
	pubkey: string;
	title: string;
	isStable?: boolean;
};
