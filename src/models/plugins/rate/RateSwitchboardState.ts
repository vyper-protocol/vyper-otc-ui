import { Connection, PublicKey } from '@solana/web3.js';
import { AggregatorAccount } from '@switchboard-xyz/switchboard-v2';
import { getAggregatorData, getAggregatorLatestValue } from 'api/switchboard/switchboardHelper';

import { RatePluginTypeIds } from '../AbsPlugin';
import { AbsRatePlugin } from './AbsRatePlugin';

export default class RateSwitchboardState extends AbsRatePlugin {
	aggregatorData: any;
	aggregatorLastValue: number;

	// eslint-disable-next-line no-unused-vars
	constructor(programPubkey: PublicKey, statePubkey: PublicKey, public switchboardAggregator: PublicKey) {
		super(programPubkey, statePubkey);
	}

	getPublicKeysForRefresh(): PublicKey[] {
		return [this.switchboardAggregator];
	}

	async loadData(connection: Connection) {
		[this.aggregatorData, this.aggregatorLastValue] = await RateSwitchboardState.LoadAggregatorData(connection, this.switchboardAggregator);
	}

	static LoadAggregatorData(connection: Connection, switchboardAggregator: PublicKey): Promise<[any, number]> {
		return Promise.all([getAggregatorData(connection, switchboardAggregator), getAggregatorLatestValue(connection, switchboardAggregator)]);
	}

	getPluginDescription(): string {
		return AggregatorAccount.getName(this.aggregatorData);
	}

	getPluginLastValue(): number {
		return this.aggregatorLastValue;
	}

	getPluginDataObj() {
		return {
			switchboardAggregator: this.switchboardAggregator.toBase58()
		};
	}

	getTypeId(): RatePluginTypeIds {
		return 'switchboard';
	}

	clone(): RateSwitchboardState {
		return new RateSwitchboardState(this.programPubkey, this.statePubkey, this.switchboardAggregator);
	}
}
