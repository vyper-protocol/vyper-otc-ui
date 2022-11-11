/* eslint-disable no-unused-vars */
import { ListItemDetail } from 'models/ListItemDetail';

import { AbsPlugin, RedeemLogicPluginTypeIds } from '../AbsPlugin';

export abstract class AbsRedeemLogicPlugin extends AbsPlugin {
	/**
	 * Returns the plugin item details.
	 * eg. forward will have strike and size
	 */
	abstract get pluginDetails(): ListItemDetail[];

	get requiredRateFeeds(): number {
		return this.rateFeedsDescription.length;
	}

	abstract get rateFeedsDescription(): string[];
	abstract get settlementPricesDescription(): string[];

	/**
	 * Returns the documentation link
	 */
	abstract get documentationLink(): string;

	/**
	 * Compute the redeem logic PnL
	 * @param prices prices to use
	 * @param buyerDepositAmount deposit amount for buyer side
	 * @param sellerDepositAmount deposit amount for buyer side
	 * @return array of 2 items: first is buyer PnL, second is the seller PnL
	 */
	abstract getPnl(prices: number[], buyerDepositAmount: number, sellerDepositAmount: number): [number, number];

	abstract get typeId(): RedeemLogicPluginTypeIds;
	abstract clone(): AbsRedeemLogicPlugin;

	// abstract getSettlementPriceLabels(): string[];
}
