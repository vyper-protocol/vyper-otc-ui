import { ListItemDetail } from 'models/ListItemDetail';

import { AbsRLState } from '../AbsRLState';
import { RLStateType } from '../RLStateType';

export class RLVanillaOption extends AbsRLState {
	// eslint-disable-next-line no-unused-vars
	constructor(public strike: number, public notional: number, public isCall: boolean, public isLinear: boolean) {
		super();
	}

	get stateType(): RLStateType {
		return new RLStateType('vanilla_option');
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
				value: this.notional
			},
			{
				label: 'Type',
				value: this.isCall ? 'Call' : 'Put'
			}
		];
	}

	clone(): RLVanillaOption {
		return new RLVanillaOption(this.strike, this.notional, this.isCall, this.isLinear);
	}

	getPluginDataObj(): any {
		return {
			strike: this.strike,
			notional: this.notional,
			isCall: this.isCall,
			isLinear: this.isLinear
		};
	}

	getPnl(prices: number[], buyerDepositAmount: number, sellerDepositAmount: number): [number, number] {
		return RLVanillaOption.getPnlExtended(prices[0], buyerDepositAmount, sellerDepositAmount, this.strike, this.notional, this.isCall, this.isLinear);
	}

	static getPnlExtended(
		price: number,
		buyerDepositAmount: number,
		sellerDepositAmount: number,
		strike: number,
		notional: number,
		isCall: boolean,
		isLinear: boolean
	): [number, number] {
		const payoff = price === 0 && !isLinear ? (!isCall || strike > 0 ? 0 : 1) : Math.max(0, isCall ? price - strike : strike - price) / (isLinear ? 1 : price);
		const buyerPnl = -buyerDepositAmount + Math.min(sellerDepositAmount, notional * payoff);
		const sellerPnl = -buyerPnl;
		return [buyerPnl, sellerPnl];
	}
}
