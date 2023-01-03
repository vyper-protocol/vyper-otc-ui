import { Cluster } from '@solana/web3.js';

import { RateTypeIds } from './common';

export type OracleDetail = {
	type: RateTypeIds;
	cluster: Cluster;
	pubkey: string;
	title: string;
	baseCurrency?: string;
	quoteCurrency?: string;
	explorerUrl: string;
	category?: string;
	tradingViewSymbol?: string;
};
