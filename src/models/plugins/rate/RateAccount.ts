import { PluginAccount } from '../PluginAccount';
import { AbsRateState } from './AbsRateState';

export class RateAccount extends PluginAccount<AbsRateState> {
	clone(): RateAccount {
		return new RateAccount(this.programPubkey, this.statePubkey, this.state.clone());
	}
}
