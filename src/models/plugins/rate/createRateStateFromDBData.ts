import { AbsRateState } from './AbsRateState';
import { RatePluginTypeIds } from './RatePluginTypeIds';
import { RatePythState } from './RatePythState';
import { RateSwitchboardState } from './RateSwitchboardState';

export function createRateStateFromDBData(type: string, data: any): AbsRateState {
	const ratePluginType = type as RatePluginTypeIds;

	switch (ratePluginType) {
		case 'switchboard':
			return RateSwitchboardState.createFromDBData(data);
		case 'pyth':
			return RatePythState.createFromDBData(data);
		default:
			throw Error('rate plugin not supported: ' + ratePluginType);
	}
}
