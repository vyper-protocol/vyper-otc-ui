import { PublicKey } from '@solana/web3.js';

import { AbsPluginState } from '../AbsPluginState';
import { RatePluginTypeIds } from './RatePluginTypeIds';

export abstract class AbsRateState extends AbsPluginState {
	abstract get title(): string;
	abstract get description(): string;

	abstract get accountsRequiredForRefresh(): PublicKey[];
	abstract get livePriceAccounts(): PublicKey[];

	abstract get typeId(): RatePluginTypeIds;
	abstract clone(): AbsRateState;
}
