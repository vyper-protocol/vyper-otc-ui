import { ConnectionProvider } from '@solana/wallet-adapter-react';
import { Cluster } from '@solana/web3.js';
import ENDPOINTS from 'configs/endpoints.json';

type ConfiguredEndpoint = {
	cluster: string;
	env: string;
	rpcEndpoint: string;
	wssEndpoint: string;
};

function getConfiguredEndpoint(cluster: Cluster): ConfiguredEndpoint {
	return ENDPOINTS.find((c) => {
		return c.cluster === cluster && c.env === process.env.NODE_ENV;
	});
}

export function getClusterEndpoint(cluster: Cluster): string {
	return getConfiguredEndpoint(cluster).rpcEndpoint;
}

export function getWssClusterEndpoint(cluster: Cluster): string {
	return getConfiguredEndpoint(cluster).wssEndpoint;
}

export function getCurrentCluster(): Cluster {
	return process.env.NEXT_PUBLIC_CLUSTER as Cluster;
}

export const OtcConnectionProvider = ({ children }) => {
	const cluster = getCurrentCluster();

	// initialized to the default cluster connection
	const endpoint = getClusterEndpoint(cluster);
	const wssEndpoint = getWssClusterEndpoint(cluster);

	return (
		<ConnectionProvider endpoint={endpoint} config={{ wsEndpoint: wssEndpoint, commitment: 'processed' }}>
			{children}
		</ConnectionProvider>
	);
};
