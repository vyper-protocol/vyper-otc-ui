export const AVAILABLE_RATE_TYPES = ['switchboard', 'pyth'] as const;
export type RatePluginTypeIds = typeof AVAILABLE_RATE_TYPES[number];
