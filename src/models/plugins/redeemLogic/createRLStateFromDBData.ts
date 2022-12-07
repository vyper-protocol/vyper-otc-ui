import { AbsPayoffState } from './AbsPayoffState';
import { Digital } from './digital/Digital';
import { Forward } from './forward/Forward';
import { SettledForward } from './settledForward/SettledForward';
import { VanillaOption } from './vanillaOption/VanillaOption';

export function createPayoffStateFromDBData(type: string, data: any): AbsPayoffState {
	switch (type) {
		case 'forward':
		case 'forward;default':
			return new Forward(data.strike, data.isLinear, data.notional);
		case 'settled_forward':
		case 'settled_forward;default':
			return new SettledForward(data.strike, data.isLinear, data.notional, data.isStandard);
		case 'digital':
		case 'digital;default':
			return new Digital(data.strike, data.isCall);
		case 'vanilla_option':
		case 'vanilla_option;default':
			return new VanillaOption(data.strike, data.notional, data.isCall, data.isLinear);
		default:
			throw Error('reedem logic plugin not supported: ' + type);
	}
}
