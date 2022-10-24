import { PublicKey } from '@solana/web3.js';
import { ListItemDetail } from 'models/ListItemDetail';

import { RedeemLogicPluginTypeIds } from '../AbsPlugin';
import { AbsRedeemLogicPlugin } from './AbsRedeemLogicPlugin';

/* eslint-disable space-before-function-paren */
export class RedeemLogicSettledForwardPlugin extends AbsRedeemLogicPlugin {
	// eslint-disable-next-line no-unused-vars
	constructor(programPubkey: PublicKey, statePubkey: PublicKey, public strike: number, public isLinear: boolean, public notional: number) {
		super(programPubkey, statePubkey);
	}

	get typeId(): RedeemLogicPluginTypeIds {
		return 'settled_forward';
	}

	getPluginDataObj(): any {
		return {
			strike: this.strike,
			isLinear: this.isLinear,
			notional: this.notional
		};
	}

	clone(): RedeemLogicSettledForwardPlugin {
		return new RedeemLogicSettledForwardPlugin(this.programPubkey, this.statePubkey, this.strike, this.isLinear, this.notional);
	}

	get rateFeedsDescription(): string[] {
		return ['Current price', 'Current price 2nd'];
	}

	get settlementPricesDescription(): string[] {
		return ['Price at settlement', 'Price at settlement 2nd'];
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

	get documentationLink(): string {
		return 'https://vyperprotocol.notion.site/Contract-Payoff-Settled-Forward-aa0f295f291545c281be6fa6363ca79a';
	}

	getPnl(prices: number[], buyerDepositAmount: number, sellerDepositAmount: number): [number, number] {
		return RedeemLogicSettledForwardPlugin.getPnlExtended(prices, buyerDepositAmount, sellerDepositAmount, this.notional, this.strike);
	}

	static getPnlExtended(prices: number[], buyerDepositAmount: number, sellerDepositAmount: number, notional: number, strike: number): [number, number] {
		const buyerPnl = Math.max(Math.min(notional * (prices[0] - strike) * prices[1], sellerDepositAmount), -buyerDepositAmount);
		const sellerPnl = -1 * buyerPnl;
		return [buyerPnl, sellerPnl];
	}
}
