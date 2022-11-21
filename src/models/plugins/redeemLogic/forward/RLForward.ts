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

	get documentationLink(): string {
		return 'https://vyperprotocol.notion.site/Contract-Payoff-Forward-0475d7640cd946f5be4a03d5e6bcad76';
	}

	getPnl(prices: number[], buyerDepositAmount: number, sellerDepositAmount: number): [number, number] {
		return RLForward.getPnlExtended(prices[0], buyerDepositAmount, sellerDepositAmount, this.notional, this.strike);
	}

	static getPnlExtended(price: number, buyerDepositAmount: number, sellerDepositAmount: number, notional: number, strike: number): [number, number] {
		const buyerPnl = Math.max(Math.min(notional * (price - strike), sellerDepositAmount), -buyerDepositAmount);
		const sellerPnl = -1 * buyerPnl;
		return [buyerPnl, sellerPnl];
	}
}
