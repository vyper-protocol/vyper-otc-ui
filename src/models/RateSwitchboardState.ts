/* eslint-disable space-before-function-paren */
import { AnchorProvider } from '@project-serum/anchor';
import { PublicKey } from '@solana/web3.js';
import { getAggregatorData, getAggregatorLatestValue } from 'api/switchboard/switchboardHelper';

export default class RateSwitchboardState {
	aggregatorData: any;
	aggregatorLastValue: number;

	// eslint-disable-next-line no-unused-vars
	constructor(public switchboarAggregator: PublicKey) {
		//
	}

	async loadAggregatorData(provider: AnchorProvider) {
		this.aggregatorData = await getAggregatorData(provider.connection, this.switchboarAggregator);
		this.aggregatorLastValue = await getAggregatorLatestValue(provider.connection, this.switchboarAggregator);
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
}
