export const AVAILABLE_RL_TYPES = ['forward', 'settled_forward', 'digital', 'vanilla_option'] as const;
export type RLPluginTypeIds = typeof AVAILABLE_RL_TYPES[number];

export class RLStateType {
	// eslint-disable-next-line no-unused-vars
	constructor(public type: RLPluginTypeIds, public subType?: string) {
		// do nothing.
	}

	toString(): string {
		if (!this.subType || String(this.subType) === 'default') return String(this.type);
		return String(this.subType);
	}
}
