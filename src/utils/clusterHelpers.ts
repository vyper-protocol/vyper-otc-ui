import clusters from 'configs/rpc_endpoints.json';
import { Cluster } from 'store/clusterStore';

/**
 * Get cluster's RPC url from config json file
 */
export const getClusterRpc = (cluster: Cluster): any => {
	const clusterMatch = clusters.find((network) => {
		return network.cluster === cluster;
	});
	return clusterMatch;
};

/**
 * Constructs a solana explorer link
 */
export const getExplorerLink = (type: 'tx' | 'address', publicKey: string, cluster: 'devnet'): string => {
	let res = `https://explorer.solana.com/${type}/${publicKey}`;

	// @ts-ignore
	if (cluster !== 'mainet-beta') res += `?cluster=${cluster}`;

	return res;
};
