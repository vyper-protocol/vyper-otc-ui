import { AnchorProvider } from '@project-serum/anchor';
import { PublicKey } from '@solana/web3.js';
import { getAggregatorData, getAggregatorLatestValue } from 'api/switchboard/switchboardHelper';

export default class RateSwitchboardState {
	aggregatorData: any;
	aggregatorLastValue: number;

	constructor(public switchboarAggregator: PublicKey) {}

	async loadAggregatorData(provider: AnchorProvider) {
		this.aggregatorData = await getAggregatorData(provider, this.switchboarAggregator);
		this.aggregatorLastValue = await getAggregatorLatestValue(provider, this.switchboarAggregator);
	}
}
