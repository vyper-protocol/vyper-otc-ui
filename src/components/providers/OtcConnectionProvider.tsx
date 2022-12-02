import { ConnectionProvider } from '@solana/wallet-adapter-react';
import { Cluster } from '@solana/web3.js';

type ConfiguredEndpoint = {
	cluster: string;
	env: string;
	rpcEndpoint: string;
	wssEndpoint: string;
};

function getConfiguredEndpoint(cluster: Cluster): ConfiguredEndpoint {
	return {
		rpcEndpoint: process.env.NEXT_PUBLIC_RPC_ENDPOINT || 'https://api.devnet.solana.com',
		wssEndpoint: process.env.NEXT_PUBLIC_WSS_ENDPOINT || 'wss://api.devnet.solana.com/',
		cluster: process.env.NEXT_PUBLIC_CLUSTER || 'devnet',
		env: process.env.NEXT_PUBLIC_LIVE_ENVIRONMENT || 'development'
	};
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
