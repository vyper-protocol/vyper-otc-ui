/* eslint-disable no-unused-vars */
import { PublicKey } from '@solana/web3.js';
import { ListItemDetail } from 'models/ListItemDetail';

import { RedeemLogicPluginTypeIds } from '../AbsPlugin';
import { AbsRedeemLogicPlugin } from './AbsRedeemLogicPlugin';

export class RedeemLogicForwardPlugin extends AbsRedeemLogicPlugin {
	constructor(programPubkey: PublicKey, statePubkey: PublicKey, public strike: number, public isLinear: boolean, public notional: number) {
		super(programPubkey, statePubkey);
	}

	get typeId(): RedeemLogicPluginTypeIds {
		return 'forward';
	}

	getPluginDataObj(): any {
		return {
			strike: this.strike,
			isLinear: this.isLinear,
			notional: this.notional
		};
	}

	clone(): RedeemLogicForwardPlugin {
		return new RedeemLogicForwardPlugin(this.programPubkey, this.statePubkey, this.strike, this.isLinear, this.notional);
	}

	get rateFeedsDescription(): string[] {
		return ['Current price'];
	}

	get settlementPricesDescription(): string[] {
		return ['Settlement price'];
	}

	get pluginDetails(): ListItemDetail[] {
		return [
			{
				label: 'Strike',
				value: this.strike
			},
			{
				label: 'Size',
				value: this.notional,
				tooltip: 'PnL moves by this much for every unit movement in the underlying price'
			}
		];
	}

	static get sourceLink(): string {
		return 'https://github.com/vyper-protocol/vyper-core/tree/dev/programs/redeem-logic-forward';
	}

	static get redeemLogicDescription(): string {
		return `A forward contract gives linear exposure to the underlying. 
				Long expects that the underlying will increase in price. 
				Short expects that the underlying will decrease in price`;
	}

	getPnl(prices: number[], buyerDepositAmount: number, sellerDepositAmount: number): [number, number] {
		return RedeemLogicForwardPlugin.getPnlExtended(prices[0], buyerDepositAmount, sellerDepositAmount, this.notional, this.strike);
	}

	static getPnlExtended(price: number, buyerDepositAmount: number, sellerDepositAmount: number, notional: number, strike: number): [number, number] {
		const buyerPnl = Math.max(Math.min(notional * (price - strike), sellerDepositAmount), -buyerDepositAmount);
		const sellerPnl = -1 * buyerPnl;
		return [buyerPnl, sellerPnl];
	}
}
