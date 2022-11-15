import { Cluster } from '@solana/web3.js';

import { RatePluginTypeIds } from './plugins/AbsPlugin';

export type OracleDetail = {
	type: RatePluginTypeIds;
	cluster: Cluster;
	pubkey: string;
	title: string;
	baseCurrency: string | undefined;
	quoteCurrency: string | undefined;
};
