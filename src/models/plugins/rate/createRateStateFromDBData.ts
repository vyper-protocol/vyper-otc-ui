import { RateTypeIds } from 'models/common';

import { AbsRateState } from './AbsRateState';
import { RatePythState } from './RatePythState';
import { RateSwitchboardState } from './RateSwitchboardState';

export function createRateStateFromDBData(type: string, data: any): AbsRateState {
	const ratePluginType = type as RateTypeIds;

	switch (ratePluginType) {
		case 'switchboard':
			return RateSwitchboardState.createFromDBData(data);
		case 'pyth':
			return RatePythState.createFromDBData(data);
		default:
			throw Error('rate plugin not supported: ' + ratePluginType);
	}
}
