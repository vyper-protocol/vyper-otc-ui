/* eslint-disable no-console */
import { getPythProgramKeyForCluster, PriceData, Product, PythHttpClient } from '@pythnetwork/client';
import { Cluster, Connection, PublicKey } from '@solana/web3.js';
import { getClusterFromRpcEndpoint } from 'utils/clusterHelpers';

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
		[this.pythProduct, this.pythPriceData] = await RatePythState.GetProductPrice(connection, getClusterFromRpcEndpoint(connection.rpcEndpoint), this.pythPrice);
	}

	static async GetProductPrice(connection: Connection, cluster: Cluster, pythPrice: PublicKey): Promise<[Product, PriceData]> {
		console.log('RatePythState.GetProductPrice, with pubkey: ' + pythPrice);
		const pythClient = new PythHttpClient(connection, getPythProgramKeyForCluster(cluster));
		const pythData = await pythClient.getData();

		console.log('pythData: ', pythData);

		const pythProduct = pythData.products.find((c) => c.price_account === pythPrice.toBase58());
		console.log('pythProduct: ', pythProduct);
		if (pythProduct) {
			const pythPriceData = pythData.productPrice.get(pythProduct.symbol);
			console.log('pythPriceData: ', pythPriceData);
			console.log('pythPriceData.price: ', pythPriceData.price);

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

	clone(): AbsRatePlugin {
		return new RatePythState(this.programPubkey, this.statePubkey, this.pythPrice);
	}
}
