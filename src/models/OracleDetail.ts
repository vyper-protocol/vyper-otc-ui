import { Cluster } from '@solana/web3.js';

import { RatePluginTypeIds } from './plugins/rate/RatePluginTypeIds';

export type OracleDetail = {
	type: RatePluginTypeIds;
	cluster: Cluster;
	pubkey: string;
	title: string | undefined;
	baseCurrency: string | undefined;
	quoteCurrency: string | undefined;
	explorerUrl: string | undefined;
};
