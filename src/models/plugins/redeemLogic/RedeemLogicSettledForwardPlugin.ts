/* eslint-disable no-unused-vars */
import { PublicKey } from '@solana/web3.js';
import { ListItemDetail } from 'models/ListItemDetail';

import { RedeemLogicPluginTypeIds } from '../AbsPlugin';
import { AbsRedeemLogicPlugin } from './AbsRedeemLogicPlugin';

/* eslint-disable space-before-function-paren */
export class RedeemLogicSettledForwardPlugin extends AbsRedeemLogicPlugin {
	// eslint-disable-next-line no-unused-vars
	constructor(
		programPubkey: PublicKey,
		statePubkey: PublicKey,
		public strike: number,
		public isLinear: boolean,
		public notional: number,
		public isStandard: boolean
	) {
		super(programPubkey, statePubkey);
	}

	get typeId(): RedeemLogicPluginTypeIds {
		return 'settled_forward';
	}

	getPluginDataObj(): any {
		return {
			strike: this.strike,
			isLinear: this.isLinear,
			notional: this.notional,
			isStandard: this.isStandard
		};
	}

	clone(): RedeemLogicSettledForwardPlugin {
		return new RedeemLogicSettledForwardPlugin(this.programPubkey, this.statePubkey, this.strike, this.isLinear, this.notional, this.isStandard);
	}

	get rateFeedsDescription(): string[] {
		return ['Current price', 'Settlement rate'];
	}

	get settlementPricesDescription(): string[] {
		return ['Settlement price', 'Settlement rate'];
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
		return 'https://github.com/vyper-protocol/vyper-core/tree/dev/programs/redeem-logic-settled-forward';
	}

	static get redeemLogicDescription(): string {
		return `A forward contract gives linear exposure to the underlying. 
				Long expects that the underlying will increase in price. 
				Short expects that the underlying will decrease in price.
				The difference vs a standard forward is that you can settle the payoff in a third currency.
				For example provide the SOL/USD and cUSDC/USD oracles to settle the SOL/USD payoff in cUSDC`;
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
