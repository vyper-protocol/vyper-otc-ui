import { ListItemDetail } from 'models/ListItemDetail';

import { AbsRLState } from '../AbsRLState';
import { RLStateType } from '../RLStateType';

export class RLDigital extends AbsRLState {
	// eslint-disable-next-line no-unused-vars
	constructor(public strike: number, public isCall: boolean) {
		super();
	}

	get stateType(): RLStateType {
		return new RLStateType('digital');
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

	clone(): RLDigital {
		return new RLDigital(this.strike, this.isCall);
	}

	getPnl(prices: number[], buyerDepositAmount: number, sellerDepositAmount: number): [number, number] {
		return RLDigital.getPnlExtended(prices[0], buyerDepositAmount, sellerDepositAmount, this.strike, this.isCall);
	}

	static getPnlExtended(price: number, buyerDepositAmount: number, sellerDepositAmount: number, strike: number, isCall: boolean): [number, number] {
		const buyerPnl = -buyerDepositAmount + ((isCall && price >= strike) || (!isCall && price < strike) ? sellerDepositAmount : 0);
		const sellerPnl = -buyerPnl;
		return [buyerPnl, sellerPnl];
	}
}
