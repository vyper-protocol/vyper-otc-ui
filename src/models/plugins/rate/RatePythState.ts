import { getPythProgramKeyForCluster, parsePriceData, PriceData, Product, PythHttpClient } from '@pythnetwork/client';
import { PythHttpClientResult } from '@pythnetwork/client/lib/PythHttpClient';
import { AccountInfo, Cluster, Connection, PublicKey } from '@solana/web3.js';
import { getCurrentCluster } from 'components/providers/OtcConnectionProvider';
import { getOracleByPubkey } from 'utils/oracleDatasetHelper';

import { AbsRateState } from './AbsRateState';
import { RatePluginTypeIds } from './RatePluginTypeIds';

export class RatePythState extends AbsRateState {
	static pythData: PythHttpClientResult = undefined;
	pythProducts: Product[];
	pythPricesData: PriceData[];

	// eslint-disable-next-line no-unused-vars
	constructor(public oracles: PublicKey[]) {
		super();
	}

	get title(): string {
		const oracleFromList = getOracleByPubkey(this.accountsRequiredForRefresh[0]);

		if (oracleFromList) {
			return oracleFromList.title;
		} else {
			return this.pythProducts[0]?.symbol;
		}
	}

	get description(): string {
		return this.pythProducts[0]?.tenor;
	}

	get typeId(): RatePluginTypeIds {
		return 'pyth';
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

	static createFromDBData(data: any): RatePythState {
		if (data.pythProduct) {
			return new RatePythState([new PublicKey(data.pythProduct)]);
		} else {
			return new RatePythState(data.oracles.map((c) => new PublicKey(c)));
		}
	}

	clone(): AbsRateState {
		return new RatePythState(this.oracles);
	}

	async loadData(connection: Connection) {
		const res = await Promise.all(this.oracles.map((c) => RatePythState.GetProductPrice(connection, getCurrentCluster(), c)));
		this.pythProducts = res.map((c) => c[0]);
		this.pythPricesData = res.map((c) => c[1]);
	}

	static async GetProductPrice(connection: Connection, cluster: Cluster, pythPrice: PublicKey): Promise<[Product, PriceData]> {
		if (!RatePythState.pythData) {
			const pythClient = new PythHttpClient(connection, getPythProgramKeyForCluster(cluster));
			RatePythState.pythData = await pythClient.getData();
		}

		const pythProduct = RatePythState.pythData.products.find((c) => c.price_account === pythPrice.toBase58());
		if (pythProduct) {
			const pythPriceData = RatePythState.pythData.productPrice.get(pythProduct.symbol);
			return [pythProduct, pythPriceData];
		} else {
			return [undefined, undefined];
		}
	}

	static DecodePriceFromAccountInfo(accountInfo: AccountInfo<Buffer>): number {
		return parsePriceData(accountInfo.data)?.price ?? 0;
	}
}
