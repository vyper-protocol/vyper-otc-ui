export type RateTypeIds = 'switchboard' | 'pyth';
export const AVAILABLE_RATE_TYPE_IDS = ['switchboard', 'pyth'];

export type PayoffTypeIds = 'forward' | 'settled_forward' | 'digital' | 'vanilla_option';
export const AVAILABLE_PAYOFF_TYPE_IDS = ['forward', 'settled_forward', 'digital', 'vanilla_option'];

/** * * * * * * * * * * * * *
 * ALIAS
 * * * * * * * * * * * * * * */

// type ForwardAliasTypeIs = 'forward2';
// const AVAILABLE_FORWARD_ALIAS_TYPE_IDS = ['forward2'];

// type SettledForwardAliasTypeIs = 'settled_forward2';
// const AVAILABLE_SETTLED_FORWARD_ALIAS_TYPE_IDS = ['settled_forward2'];

// type DigitalAliasTypeIds = '';
// const AVAILABLE_DIGITAL_ALIAS_TYPE_IDS = [''];

// type VanillaOptionAliasTypeIds = '';
// const AVAILABLE_VANILLA_OPTION_ALIAS_TYPE_IDS = [''];

// eslint-disable-next-line no-inline-comments
export type AliasTypeIds = PayoffTypeIds;
// | DigitalAliasTypeIds | VanillaOptionAliasTypeIds;
/* | ForwardAliasTypeIs | SettledForwardAliasTypeIs | DigitalAliasTypeIs | VanillaOptionAliasTypeIs */

export const AVAILABLE_ALIAS_TYPE_IDS = [
	...AVAILABLE_PAYOFF_TYPE_IDS
	// ...AVAILABLE_FORWARD_ALIAS_TYPE_IDS
	// ...AVAILABLE_SETTLED_FORWARD_ALIAS_TYPE_IDS,
	// ...AVAILABLE_DIGITAL_ALIAS_TYPE_IDS,
	// ...AVAILABLE_VANILLA_OPTION_ALIAS_TYPE_IDS
];

export function getPayoffFromAlias(v: AliasTypeIds): PayoffTypeIds {
	if (AVAILABLE_PAYOFF_TYPE_IDS.includes(v)) return v as PayoffTypeIds;

	// if (AVAILABLE_FORWARD_ALIAS_TYPE_IDS.includes(v)) return 'forward';
	// if (AVAILABLE_SETTLED_FORWARD_ALIAS_TYPE_IDS.includes(v)) return 'settled_forward';
	// if (AVAILABLE_DIGITAL_ALIAS_TYPE_IDS.includes(v)) return 'digital';
	// if (AVAILABLE_VANILLA_OPTION_ALIAS_TYPE_IDS.includes(v)) return 'vanilla_option';
}
