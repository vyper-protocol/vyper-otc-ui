import { AccountInfo, Connection, PublicKey } from '@solana/web3.js';
import { AggregatorAccount } from '@switchboard-xyz/switchboard-v2';
import { loadSwitchboardProgramOffline } from 'api/switchboard/switchboardHelper';
import { getCurrentCluster } from 'components/providers/OtcConnectionProvider';

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

	static async LoadAggregatorData(connection: Connection, switchboardAggregator: PublicKey): Promise<[any, number]> {
		const switchboardProgram = loadSwitchboardProgramOffline(getCurrentCluster() as 'mainnet-beta' | 'devnet', connection);
		const aggregatorAccount = new AggregatorAccount({
			program: switchboardProgram,
			publicKey: switchboardAggregator
		});
		const data = await aggregatorAccount.loadData();
		const lastValue = (await aggregatorAccount.getLatestValue(data)).toNumber();
		return [data, lastValue];
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

	static async DecodePriceFromAccountInfo(connection: Connection, accountInfo: AccountInfo<Buffer>): Promise<number> {
		const switchboardProgram = loadSwitchboardProgramOffline(getCurrentCluster() as 'mainnet-beta' | 'devnet', connection);
		const aggregatorAccount = new AggregatorAccount({
			program: switchboardProgram,
			publicKey: PublicKey.unique()
		});

		const data = AggregatorAccount.decode(switchboardProgram, accountInfo);
		return (await aggregatorAccount.getLatestValue(data)).toNumber();
	}

	get pubkeyForLivePrice(): PublicKey {
		return this.switchboardAggregator;
	}

	getTypeId(): RatePluginTypeIds {
		return 'switchboard';
	}

	clone(): RateSwitchboardState {
		return new RateSwitchboardState(this.programPubkey, this.statePubkey, this.switchboardAggregator);
	}
}
