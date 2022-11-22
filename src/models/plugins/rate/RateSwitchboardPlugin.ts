import { AccountInfo, Connection, PublicKey } from '@solana/web3.js';
import { AggregatorAccount } from '@switchboard-xyz/switchboard-v2';
import { loadSwitchboardProgramOffline } from 'api/switchboard/switchboardHelper';
import { getCurrentCluster } from 'components/providers/OtcConnectionProvider';
import { getOracleByPubkey } from 'utils/oracleDatasetHelper';

import { RatePluginTypeIds } from '../AbsPlugin';
import { AbsRatePlugin } from './AbsRatePlugin';

export default class RateSwitchboardPlugin extends AbsRatePlugin {
	aggregatorsData: any;

	// eslint-disable-next-line no-unused-vars
	constructor(programPubkey: PublicKey, statePubkey: PublicKey, public oracles: PublicKey[]) {
		super(programPubkey, statePubkey);
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

	clone(): RateSwitchboardPlugin {
		return new RateSwitchboardPlugin(this.programPubkey, this.statePubkey, this.oracles);
	}

	async loadData(connection: Connection) {
		this.aggregatorsData = await Promise.all(this.oracles.map((c) => RateSwitchboardPlugin.LoadAggregatorData(connection, c)));
	}

	static async LoadAggregatorData(connection: Connection, switchboardAggregator: PublicKey): Promise<any> {
		const switchboardProgram = loadSwitchboardProgramOffline(getCurrentCluster() as 'mainnet-beta' | 'devnet', connection);
		const aggregatorAccount = new AggregatorAccount({
			program: switchboardProgram,
			publicKey: switchboardAggregator
		});
		return await aggregatorAccount.loadData();
	}

	static async GetLatestPrice(connection: Connection, switchboardAggregator: PublicKey): Promise<any> {
		const switchboardProgram = loadSwitchboardProgramOffline(getCurrentCluster() as 'mainnet-beta' | 'devnet', connection);
		const aggregatorAccount: AggregatorAccount = new AggregatorAccount({
			program: switchboardProgram,
			publicKey: switchboardAggregator
		});
		return (await aggregatorAccount.getLatestValue()).toNumber();
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
