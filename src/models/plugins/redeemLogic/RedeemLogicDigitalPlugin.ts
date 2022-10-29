import { PublicKey } from '@solana/web3.js';
import { ListItemDetail } from 'models/ListItemDetail';

import { RedeemLogicPluginTypeIds } from '../AbsPlugin';
import { AbsRedeemLogicPlugin } from './AbsRedeemLogicPlugin';

/* eslint-disable space-before-function-paren */
export class RedeemLogicDigitalPlugin extends AbsRedeemLogicPlugin {
	// eslint-disable-next-line no-unused-vars
	constructor(programPubkey: PublicKey, statePubkey: PublicKey, public strike: number, public isCall: boolean) {
		super(programPubkey, statePubkey);
	}

	get typeId(): RedeemLogicPluginTypeIds {
		return 'digital';
	}

	getPluginDataObj(): any {
		return {
			strike: this.strike,
			isCall: this.isCall
		};
	}

	clone(): RedeemLogicDigitalPlugin {
		return new RedeemLogicDigitalPlugin(this.programPubkey, this.statePubkey, this.strike, this.isCall);
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
				label: 'Type',
				value: this.isCall ? 'Call' : 'Put',
				tooltip: this.isCall ? 'Long makes money if final price is >= strike' : 'Long makes money if final price is < strike'
			}
		];
	}

	get documentationLink(): string {
		return 'https://vyperprotocol.notion.site/Contract-Payoff-Digital-39cab877a28a4a6fa349d9b816bd15a4';
	}

	getPnl(prices: number[], buyerDepositAmount: number, sellerDepositAmount: number): [number, number] {
		return RedeemLogicDigitalPlugin.getPnlExtended(prices[0], buyerDepositAmount, sellerDepositAmount, this.strike, this.isCall);
	}

	static getPnlExtended(price: number, buyerDepositAmount: number, sellerDepositAmount: number, strike: number, isCall: boolean): [number, number] {
		const buyerPnl = -buyerDepositAmount + ((isCall && price >= strike) || (!isCall && price < strike) ? sellerDepositAmount : 0);
		const sellerPnl = -buyerPnl;
		return [buyerPnl, sellerPnl];
	}
}