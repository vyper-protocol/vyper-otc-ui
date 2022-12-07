import { ListItemDetail } from 'models/ListItemDetail';

import { PayoffTypeIds } from '../../../common';
import { AbsPayoffState } from '../AbsPayoffState';

export class SettledForward extends AbsPayoffState {
	constructor(public strike: number, public isLinear: boolean, public notional: number, public isStandard: boolean) {
		super();
	}

	get payoffId(): PayoffTypeIds {
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

	clone(): SettledForward {
		return new SettledForward(this.strike, this.isLinear, this.notional, this.isStandard);
	}

	getPnl(prices: number[], longDepositAmount: number, shortDepositAmount: number): [number, number] {
		return SettledForward.getPnlExtended(prices, longDepositAmount, shortDepositAmount, this.notional, this.strike, this.isLinear, this.isStandard);
	}

	static getPnlExtended(
		prices: number[],
		longDepositAmount: number,
		shortDepositAmount: number,
		notional: number,
		strike: number,
		isLinear: boolean,
		isStandard: boolean
	): [number, number] {
		const buyerPnl = Math.max(
			Math.min(
				((notional * (prices[0] - strike)) / (isLinear ? 1 : prices[0])) * (isStandard || prices[1] === 0 ? prices[1] : 1 / prices[1]),
				shortDepositAmount
			),
			-longDepositAmount
		);
		const sellerPnl = -1 * buyerPnl;
		return [buyerPnl, sellerPnl];
	}
}
