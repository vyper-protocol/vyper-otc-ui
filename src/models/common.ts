export const AVAILABLE_RATE_TYPE_IDS = ['switchboard', 'pyth'] as const;
export type RateTypeIds = typeof AVAILABLE_RATE_TYPE_IDS[number];

export const AVAILABLE_PAYOFF_TYPE_IDS = ['forward', 'settled_forward', 'digital', 'vanilla_option'];
export type PayoffTypeIds = typeof AVAILABLE_PAYOFF_TYPE_IDS[number];
