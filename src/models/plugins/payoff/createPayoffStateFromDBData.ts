import { AbsPayoffState } from './AbsPayoffState';
import { Digital } from './Digital';
import { Forward } from './Forward';
import { SettledForward } from './SettledForward';
import { VanillaOption } from './VanillaOption';

export function createPayoffStateFromDBData(type: string, data: any): AbsPayoffState {
	switch (type) {
		case 'forward':
			return new Forward(data.strike, data.isLinear, data.notional);
		case 'settled_forward':
			return new SettledForward(data.strike, data.isLinear, data.notional, data.isStandard);
		case 'digital':
			return new Digital(data.strike, data.isCall);
		case 'vanilla_option':
			return new VanillaOption(data.strike, data.notional, data.isCall, data.isLinear);
		default:
			throw Error('reedem logic plugin not supported: ' + type);
	}
}
