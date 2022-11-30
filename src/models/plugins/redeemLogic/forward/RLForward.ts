import { ListItemDetail } from 'models/ListItemDetail';

import { AbsRLState } from '../AbsRLState';
import { RLStateType } from '../RLStateType';

export class RLForward extends AbsRLState {
	// eslint-disable-next-line no-unused-vars
	constructor(public strike: number, public isLinear: boolean, public notional: number) {
		super();
	}

	get stateType(): RLStateType {
		return new RLStateType('forward');
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

	clone(): RLForward {
		return new RLForward(this.strike, this.isLinear, this.notional);
	}

	getPnl(prices: number[], buyerDepositAmount: number, sellerDepositAmount: number): [number, number] {
		return RLForward.getPnlExtended(prices[0], buyerDepositAmount, sellerDepositAmount, this.notional, this.strike, this.isLinear);
	}

	static getPnlExtended(
		price: number,
		buyerDepositAmount: number,
		sellerDepositAmount: number,
		notional: number,
		strike: number,
		isLinear: boolean
	): [number, number] {
		const buyerPnl = Math.max(Math.min((notional * (price - strike)) / (isLinear ? 1 : price), sellerDepositAmount), -buyerDepositAmount);
		const sellerPnl = -1 * buyerPnl;
		return [buyerPnl, sellerPnl];
	}
}
