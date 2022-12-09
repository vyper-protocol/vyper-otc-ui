import { Cluster } from '@solana/web3.js';

import { RateTypeIds } from './common';

export type OracleDetail = {
	type: RateTypeIds;
	cluster: Cluster;
	pubkey: string;
	title: string | undefined;
	baseCurrency?: string | undefined;
	quoteCurrency?: string | undefined;
	explorerUrl: string | undefined;
	category?: string | undefined;
};
