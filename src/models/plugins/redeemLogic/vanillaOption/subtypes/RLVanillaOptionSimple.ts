import { ListItemDetail } from 'models/ListItemDetail';

import { RLStateType } from '../../RLStateType';
import { RLVanillaOption } from '../RLVanillaOption';

export class RLVanillaOptionSimple extends RLVanillaOption {
	get stateType(): RLStateType {
		return new RLStateType('vanilla_option', 'simple');
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
			}
		];
	}

	clone(): RLVanillaOptionSimple {
		return new RLVanillaOptionSimple(this.strike, this.notional, this.isCall, this.isLinear);
	}
}
