import { Address } from '@project-serum/anchor';

import { AbsPluginState } from './AbsPluginState';

export class PluginAccount<T extends AbsPluginState> {
	// eslint-disable-next-line no-unused-vars
	constructor(public programPubkey: Address, public statePubkey: Address, public state: T) {
		// do nothing.
	}
}
