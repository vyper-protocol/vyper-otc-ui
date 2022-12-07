import { PluginAccount } from '../PluginAccount';
import { AbsPayoffState } from './AbsPayoffState';

export class PayoffAccount extends PluginAccount<AbsPayoffState> {
	clone(): PayoffAccount {
		return new PayoffAccount(this.programPubkey, this.statePubkey, this.state.clone());
	}
}
