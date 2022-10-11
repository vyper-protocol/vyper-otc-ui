/* eslint-disable no-console */
import { getPythProgramKeyForCluster, PriceData, Product, PythHttpClient } from '@pythnetwork/client';
import { Cluster, Connection, PublicKey } from '@solana/web3.js';

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
		console.log('RatePythState.loadData()');
		[this.pythProduct, this.pythPriceData] = await RatePythState.GetProductPrice(connection, 'devnet', this.pythPrice);
	}

	static async GetProductPrice(connection: Connection, cluster: Cluster, pythPrice: PublicKey): Promise<[Product, PriceData]> {
		console.log('RatePythState.GetProductPrice, with pubkey: ' + pythPrice);
		const pythClient = new PythHttpClient(connection, getPythProgramKeyForCluster(cluster));
		const pythData = await pythClient.getData();

		console.log('pythData: ', pythData);

		const pythProduct = pythData.products.find((c) => c.price_account === pythPrice.toBase58());
		console.log('pythProduct: ', pythProduct);

		const pythPriceData = pythData.productPrice.get(pythProduct.symbol);
		console.log('pythPriceData: ', pythPriceData);

		return [pythProduct, pythPriceData];
	}

	getPluginDescription(): string {
		return this.pythProduct.description;
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

	clone(): AbsRatePlugin {
		return new RatePythState(this.programPubkey, this.statePubkey, this.pythPrice);
	}
}
