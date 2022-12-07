import { PublicKey } from '@solana/web3.js';
import { RateTypeIds } from 'models/common';

import { AbsPluginState } from '../AbsPluginState';

export abstract class AbsRateState extends AbsPluginState {
	abstract get title(): string;
	abstract get description(): string;

	abstract get accountsRequiredForRefresh(): PublicKey[];
	abstract get livePriceAccounts(): PublicKey[];

	abstract get rateId(): RateTypeIds;
	abstract clone(): AbsRateState;
}
