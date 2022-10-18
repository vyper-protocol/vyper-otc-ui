import { getPythProgramKeyForCluster, parsePriceData, PriceData, Product, PythHttpClient } from '@pythnetwork/client';
import { AccountInfo, Cluster, Connection, PublicKey } from '@solana/web3.js';
import { getCurrentCluster } from 'components/providers/OtcConnectionProvider';

import { RatePluginTypeIds } from '../AbsPlugin';
import { AbsRatePlugin } from './AbsRatePlugin';

export class RatePythState extends AbsRatePlugin {
	pythProduct: Product;
	pythPriceData: PriceData;

	// eslint-disable-next-line no-unused-vars
	constructor(programPubkey: PublicKey, statePubkey: PublicKey, public pythPrice: PublicKey) {
		super(programPubkey, statePubkey);
	}

	async loadData(connection: Connection) {
		[this.pythProduct, this.pythPriceData] = await RatePythState.GetProductPrice(connection, getCurrentCluster(), this.pythPrice);
	}

	static async GetProductPrice(connection: Connection, cluster: Cluster, pythPrice: PublicKey): Promise<[Product, PriceData]> {
		const pythClient = new PythHttpClient(connection, getPythProgramKeyForCluster(cluster));
		const pythData = await pythClient.getData();

		const pythProduct = pythData.products.find((c) => c.price_account === pythPrice.toBase58());
		if (pythProduct) {
			const pythPriceData = pythData.productPrice.get(pythProduct.symbol);
			return [pythProduct, pythPriceData];
		} else {
			return [undefined, undefined];
		}
	}

	getPluginDescription(): string {
		return this.pythProduct.symbol;
	}

	getPluginLastValue(): number {
		if (!this.pythPriceData) return 0;
		return this.pythPriceData.price;
	}

	getPluginDataObj() {
		return {
			pythProduct: this.pythPrice.toBase58()
		};
	}

	getTypeId(): RatePluginTypeIds {
		return 'pyth';
	}

	getPublicKeysForRefresh(): PublicKey[] {
		return [this.pythPrice];
	}

	get pubkeyForLivePrice(): PublicKey {
		return this.pythPrice;
	}

	static DecodePriceFromAccountInfo(accountInfo: AccountInfo<Buffer>): number {
		return parsePriceData(accountInfo.data)?.price ?? 0;
	}

	clone(): AbsRatePlugin {
		return new RatePythState(this.programPubkey, this.statePubkey, this.pythPrice);
	}
}
