export const DEFAULT_PAGE_TITLE = 'Vyper OTC 🐍';

export function buildPageTitle(v: string): string {
	return `${v} | ${DEFAULT_PAGE_TITLE}`;
}
