import { AbsRLState } from './AbsRLState';
import { RLDigital } from './digital/RLDigital';
import { RLForward } from './forward/RLForward';
import { RLSettledForward } from './settledForward/RLSettledForward';
import { RLVanillaOption } from './vanillaOption/RLVanillaOption';
import { RLVanillaOptionSimple } from './vanillaOption/subtypes/RLVanillaOptionSimple';

export function createRLStateFromDBData(type: string, data: any): AbsRLState {
	switch (type) {
		case 'forward':
		case 'forward;default':
			return new RLForward(data.strike, data.isLinear, data.notional);
		case 'settled_forward':
		case 'settled_forward;default':
			return new RLSettledForward(data.strike, data.isLinear, data.notional, data.isStandard);
		case 'digital':
		case 'digital;default':
			return new RLDigital(data.strike, data.isCall);
		case 'vanilla_option':
		case 'vanilla_option;default':
			return new RLVanillaOption(data.strike, data.notional, data.isCall, data.isLinear);
		case 'vanilla_option;simple':
			return new RLVanillaOptionSimple(data.strike, data.notional, data.isCall, data.isLinear);
		default:
			throw Error('reedem logic plugin not supported: ' + type);
	}
}
