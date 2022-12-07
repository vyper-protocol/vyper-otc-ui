import { ListItemDetail } from 'models/ListItemDetail';

import { PayoffTypeIds } from '../../../common';
import { AbsPayoffState } from '../AbsPayoffState';

export class Digital extends AbsPayoffState {
	constructor(public strike: number, public isCall: boolean) {
		super();
	}

	get payoffId(): PayoffTypeIds {
		return 'digital';
	}

	getPluginDataObj(): any {
		return {
			strike: this.strike,
			isCall: this.isCall
		};
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

	clone(): Digital {
		return new Digital(this.strike, this.isCall);
	}

	getPnl(prices: number[], buyerDepositAmount: number, sellerDepositAmount: number): [number, number] {
		return Digital.getPnlExtended(prices[0], buyerDepositAmount, sellerDepositAmount, this.strike, this.isCall);
	}

	static getPnlExtended(price: number, buyerDepositAmount: number, sellerDepositAmount: number, strike: number, isCall: boolean): [number, number] {
		const buyerPnl = -buyerDepositAmount + ((isCall && price >= strike) || (!isCall && price < strike) ? sellerDepositAmount : 0);
		const sellerPnl = -buyerPnl;
		return [buyerPnl, sellerPnl];
	}
}
