import { AccountInfo, Connection, PublicKey } from '@solana/web3.js';
import { AggregatorAccount } from '@switchboard-xyz/switchboard-v2';
import { loadSwitchboardProgramOffline } from 'api/switchboard/switchboardHelper';
import { getCurrentCluster } from 'components/providers/OtcConnectionProvider';
import { getOracleByPubkey } from 'utils/oracleDatasetHelper';

import { AbsRateState } from './AbsRateState';
import { RatePluginTypeIds } from './RatePluginTypeIds';

export class RateSwitchboardState extends AbsRateState {
	aggregatorsData: any;

	// eslint-disable-next-line no-unused-vars
	constructor(public oracles: PublicKey[]) {
		super();
	}

	get title(): string {
		try {
			const oracleFromList = getOracleByPubkey(this.accountsRequiredForRefresh[0]);

			if (oracleFromList) {
				return oracleFromList.title;
			} else {
				return AggregatorAccount.getName(this.aggregatorsData[0]);
			}
		} catch {
			return '-';
		}
	}

	get description(): string {
		return this.title;
	}

	get typeId(): RatePluginTypeIds {
		return 'switchboard';
	}

	get livePriceAccounts(): PublicKey[] {
		return this.oracles;
	}

	get accountsRequiredForRefresh(): PublicKey[] {
		return this.oracles;
	}

	getPluginDataObj() {
		return {
			oracles: this.oracles.map((c) => c.toBase58())
		};
	}

	static createFromDBData(data: any): RateSwitchboardState {
		if (data.switchboardAggregator) {
			return new RateSwitchboardState([new PublicKey(data.switchboardAggregator)]);
		} else {
			return new RateSwitchboardState(data.oracles.map((c) => new PublicKey(c)));
		}
	}

	clone(): RateSwitchboardState {
		return new RateSwitchboardState(this.oracles);
	}

	async loadData(connection: Connection) {
		this.aggregatorsData = await Promise.all(this.oracles.map((c) => RateSwitchboardState.LoadAggregatorData(connection, c)));
	}

	static async LoadAggregatorData(connection: Connection, switchboardAggregator: PublicKey): Promise<any> {
		const switchboardProgram = loadSwitchboardProgramOffline(getCurrentCluster() as 'mainnet-beta' | 'devnet', connection);
		const aggregatorAccount = new AggregatorAccount({
			program: switchboardProgram,
			publicKey: switchboardAggregator
		});
		return await aggregatorAccount.loadData();
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

	// get pubkeysForLivePrice(): { label: string; pubkey: PublicKey }[] {
	// 	const res: { label: string; pubkey: PublicKey }[] = [];

	// 	if (this.switchboardAggregators[0]) {
	// 		res.push({ label: 'Current price', pubkey: this.switchboardAggregators[0] });
	// 	}

	// 	if (this.switchboardAggregators[1]) {
	// 		res.push({ label: 'Settlement rate', pubkey: this.switchboardAggregators[1] });
	// 	}

	// 	return res;
	// }
}
