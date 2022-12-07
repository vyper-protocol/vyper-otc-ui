import { PayoffTypeIds } from 'models/common';
import { ListItemDetail } from 'models/ListItemDetail';
import { getRedeemLogicDocumentionLink, getRedeemLogicSourceCodeLink, getRedeemLogicDescription } from 'utils/redeemLogicMetadataHelper';

import { AbsPluginState } from '../AbsPluginState';

export abstract class AbsPayoffState extends AbsPluginState {
	abstract get payoffId(): PayoffTypeIds;

	get requiredRateFeeds(): number {
		return this.rateFeedsDescription.length;
	}

	abstract clone(): AbsPayoffState;
	abstract get rateFeedsDescription(): string[];
	abstract get settlementPricesDescription(): string[];

	/**
	 * Returns the plugin item details.
	 * eg. forward will have strike and size
	 */
	abstract get pluginDetails(): ListItemDetail[];

	/**
	 * Returns the documentation link
	 */
	get documentationLink(): string {
		return getRedeemLogicDocumentionLink(this.payoffId);
	}

	/**
	 * Returns the source code reference link
	 */
	get sourceCode(): string {
		return getRedeemLogicSourceCodeLink(this.payoffId);
	}

	/**
	 * Returns description
	 */
	get description(): string {
		return getRedeemLogicDescription(this.payoffId);
	}

	/**
	 * Compute the redeem logic PnL
	 * @param prices prices to use
	 * @param longDepositAmount deposit amount for buyer side
	 * @param shortDepositAmount deposit amount for seller side
	 * @return array of 2 items: first is long PnL, second is the short PnL
	 */
	// eslint-disable-next-line no-unused-vars
	abstract getPnl(prices: number[], longDepositAmount: number, shortDepositAmount: number): [number, number];

	// abstract clone(): AbsRLState;
}
