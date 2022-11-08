import { getPythProgramKeyForCluster, parsePriceData, PriceData, Product, PythHttpClient } from '@pythnetwork/client';
import { PythHttpClientResult } from '@pythnetwork/client/lib/PythHttpClient';
import { AccountInfo, Cluster, Connection, PublicKey } from '@solana/web3.js';
import { getCurrentCluster } from 'components/providers/OtcConnectionProvider';

import { RatePluginTypeIds } from '../AbsPlugin';
import { AbsRatePlugin } from './AbsRatePlugin';

export class RatePythPlugin extends AbsRatePlugin {
	static pythData: PythHttpClientResult = undefined;
	pythProducts: Product[];
	pythPricesData: PriceData[];

	// eslint-disable-next-line no-unused-vars
	constructor(programPubkey: PublicKey, statePubkey: PublicKey, public oracles: PublicKey[]) {
		super(programPubkey, statePubkey);
	}

	get title(): string {
		return this.pythProducts[0]?.symbol;
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

	clone(): AbsRatePlugin {
		return new RatePythPlugin(this.programPubkey, this.statePubkey, this.oracles);
	}

	async loadData(connection: Connection) {
		const res = await Promise.all(this.oracles.map((c) => RatePythPlugin.GetProductPrice(connection, getCurrentCluster(), c)));
		this.pythProducts = res.map((c) => c[0]);
		this.pythPricesData = res.map((c) => c[1]);
	}

	static async GetProductPrice(connection: Connection, cluster: Cluster, pythPrice: PublicKey): Promise<[Product, PriceData]> {
		if (!RatePythPlugin.pythData) {
			const pythClient = new PythHttpClient(connection, getPythProgramKeyForCluster(cluster));
			RatePythPlugin.pythData = await pythClient.getData();
		}

		const pythProduct = RatePythPlugin.pythData.products.find((c) => c.price_account === pythPrice.toBase58());
		if (pythProduct) {
			const pythPriceData = RatePythPlugin.pythData.productPrice.get(pythProduct.symbol);
			return [pythProduct, pythPriceData];
		} else {
			return [undefined, undefined];
		}
	}

	static DecodePriceFromAccountInfo(accountInfo: AccountInfo<Buffer>): number {
		return parsePriceData(accountInfo.data)?.price ?? 0;
	}

	// getPublicKeysForRefresh(): PublicKey[] {
	// 	return this.pythPrices;
	// }

	// get pubkeysForLivePrice(): { label: string; pubkey: PublicKey }[] {
	// 	const res: { label: string; pubkey: PublicKey }[] = [];

	// 	if (this.pythPrices[0]) {
	// 		res.push({ label: 'Current price', pubkey: this.pythPrices[0] });
	// 	}

	// 	if (this.pythPrices[1]) {
	// 		res.push({ label: 'Settlement rate', pubkey: this.pythPrices[1] });
	// 	}

	// 	return res;
	// }
}
