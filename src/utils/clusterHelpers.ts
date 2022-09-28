/**
 * Constructs a solana explorer link
 */
export const getExplorerLink = (type: 'tx' | 'address', publicKey: string, cluster: 'devnet'): string => {
	let res = `https://explorer.solana.com/${type}/${publicKey}`;

	// @ts-ignore
	if (cluster !== 'mainet-beta') res += `?cluster=${cluster}`;

	return res;
};
