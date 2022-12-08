export const DEFAULT_PAGE_TITLE = 'Vyper OTC 🐍';
export const DEFAULT_PAGE_DESCRIPTION =
	'Vyper OTC is a peer-to-peer marketplace that allows anyone to trade a wide range of on-chain derivatives in a transparent and easy way. Users can choose from a wide range of assets and trade securely thanks to fully collateralized positions.';

export function buildPageTitle(v: string): string {
	return `${v} | ${DEFAULT_PAGE_TITLE}`;
}
