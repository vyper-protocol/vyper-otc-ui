/* eslint-disable space-before-function-paren */
import { AnchorProvider } from '@project-serum/anchor';
import { PublicKey } from '@solana/web3.js';
import { getAggregatorData, getAggregatorLatestValue } from 'api/switchboard/switchboardHelper';

import { AbsPlugin } from './AbsPlugin';

export default class RateSwitchboardState extends AbsPlugin {
	aggregatorData: any;
	aggregatorLastValue: number;

	// eslint-disable-next-line no-unused-vars
	constructor(programPubkey: PublicKey, statePubkey: PublicKey, public switchboardAggregator: PublicKey) {
		super(programPubkey, statePubkey);
	}

	async loadAggregatorData(provider: AnchorProvider) {
		[this.aggregatorData, this.aggregatorLastValue] = await Promise.all([
			getAggregatorData(provider.connection, this.switchboardAggregator),
			getAggregatorLatestValue(provider.connection, this.switchboardAggregator)
		]);
	}

	getAggregatorName() {
		let name = '';
		try {
			name = String.fromCharCode.apply(null, this.aggregatorData.name).split('\u0000')[0];
		} catch (error) {
			name = 'Not found';
		}
		return name;
	}

	getPluginDataObj() {
		return {
			switchboardAggregator: this.switchboardAggregator.toBase58()
		};
	}
	getTypeId(): string {
		return 'switchboard';
	}
}
