import { ListItemDetail } from 'models/ListItemDetail';

import { PayoffTypeIds } from '../../../common';
import { AbsPayoffState } from '../AbsPayoffState';

export class Forward extends AbsPayoffState {
	constructor(public strike: number, public isLinear: boolean, public notional: number) {
		super();
	}

	get payoffId(): PayoffTypeIds {
		return 'forward';
	}

	getPluginDataObj(): any {
		return {
			strike: this.strike,
			isLinear: this.isLinear,
			notional: this.notional
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
				label: 'Size',
				value: this.notional,
				tooltip: 'PnL moves by this much for every unit movement in the underlying price'
			}
		];
	}

	clone(): Forward {
		return new Forward(this.strike, this.isLinear, this.notional);
	}

	getPnl(prices: number[], longDepositAmount: number, shortDepositAmount: number): [number, number] {
		return Forward.getPnlExtended(prices[0], longDepositAmount, shortDepositAmount, this.notional, this.strike, this.isLinear);
	}

	static getPnlExtended(
		price: number,
		longDepositAmount: number,
		shortDepositAmount: number,
		notional: number,
		strike: number,
		isLinear: boolean
	): [number, number] {
		const buyerPnl = Math.max(Math.min((notional * (price - strike)) / (isLinear ? 1 : price), shortDepositAmount), -longDepositAmount);
		const sellerPnl = -1 * buyerPnl;
		return [buyerPnl, sellerPnl];
	}
}
