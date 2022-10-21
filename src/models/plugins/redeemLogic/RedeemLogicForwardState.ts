import { PublicKey } from '@solana/web3.js';

import { RedeemLogicPluginTypeIds } from '../AbsPlugin';
import { AbsRedeemLogicPlugin, RedeemLogicPluginDetail } from './AbsRedeemLogicPlugin';

/* eslint-disable space-before-function-paren */
export class RedeemLogicForwardState extends AbsRedeemLogicPlugin {
	// eslint-disable-next-line no-unused-vars
	constructor(programPubkey: PublicKey, statePubkey: PublicKey, public strike: number, public isLinear: boolean, public notional: number) {
		super(programPubkey, statePubkey);
	}

	getPluginDataObj(): any {
		return {
			strike: this.strike,
			isLinear: this.isLinear,
			notional: this.notional
		};
	}
	getTypeId(): RedeemLogicPluginTypeIds {
		return 'forward';
	}

	clone(): RedeemLogicForwardState {
		return new RedeemLogicForwardState(this.programPubkey, this.statePubkey, this.strike, this.isLinear, this.notional);
	}

	getPluginDetails(): RedeemLogicPluginDetail[] {
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

	getPnl(price: number, buyerDepositAmount: number, sellerDepositAmount: number): [number, number] {
		return RedeemLogicForwardState.getPnlExtended(price, buyerDepositAmount, sellerDepositAmount, this.notional, this.strike);
	}

	static getPnlExtended(price: number, buyerDepositAmount: number, sellerDepositAmount: number, notional: number, strike: number): [number, number] {
		const buyerPnl = Math.max(Math.min(notional * (price - strike), sellerDepositAmount), -buyerDepositAmount);
		const sellerPnl = -1 * buyerPnl;
		return [buyerPnl, sellerPnl];
	}

	getNotionLink(): string {
		return 'https://vyperprotocol.notion.site/Contract-Payoff-Forward-0475d7640cd946f5be4a03d5e6bcad76';
	}
}
