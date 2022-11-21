import { ListItemDetail } from 'models/ListItemDetail';
import { getRedeemLogicDocumentionLink, getRedeemLogicSoruceCodeLink as getRedeemLogicSourceCodeLink } from 'utils/urlBuilder';

import { AbsPluginState } from '../AbsPluginState';
import { RLStateType } from './RLStateType';

export abstract class AbsRLState extends AbsPluginState {
	abstract get stateType(): RLStateType;

	getTypeLabel(): string {
		return this.stateType.toString();
	}

	get requiredRateFeeds(): number {
		return this.rateFeedsDescription.length;
	}

	abstract clone(): AbsRLState;
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
		return getRedeemLogicDocumentionLink(this.stateType.type);
	}

	/**
	 * Returns the source code reference link
	 */
	get sourceCode(): string {
		return getRedeemLogicSourceCodeLink(this.stateType.type);
	}

	/**
	 * Compute the redeem logic PnL
	 * @param prices prices to use
	 * @param buyerDepositAmount deposit amount for buyer side
	 * @param sellerDepositAmount deposit amount for buyer side
	 * @return array of 2 items: first is buyer PnL, second is the seller PnL
	 */
	// eslint-disable-next-line no-unused-vars
	abstract getPnl(prices: number[], buyerDepositAmount: number, sellerDepositAmount: number): [number, number];

	// abstract clone(): AbsRLState;
}
