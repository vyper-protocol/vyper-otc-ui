import { PluginAccount } from '../PluginAccount';
import { AbsRLState } from './AbsRLState';

export class RLAccount extends PluginAccount<AbsRLState> {
	clone(): RLAccount {
		return new RLAccount(this.programPubkey, this.statePubkey, this.state.clone());
	}
}
