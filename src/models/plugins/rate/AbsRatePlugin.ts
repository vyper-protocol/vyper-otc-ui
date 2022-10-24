import { PublicKey } from '@solana/web3.js';

import { AbsPlugin, RatePluginTypeIds } from '../AbsPlugin';

export abstract class AbsRatePlugin extends AbsPlugin {
	abstract get title(): string;
	abstract get description(): string;

	abstract get accountsRequiredForRefresh(): PublicKey[];
	abstract get livePriceAccounts(): PublicKey[];

	abstract get typeId(): RatePluginTypeIds;
	abstract clone(): AbsRatePlugin;

	// // eslint-disable-next-line no-unused-vars
	// abstract loadData(connection: Connection): Promise<void>;
	// abstract getPublicKeysForRefresh(): PublicKey[];
	// abstract getPluginDescription(): string;
}
