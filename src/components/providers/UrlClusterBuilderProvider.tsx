/* eslint-disable no-console */
/* eslint-disable no-unused-vars */
import { createContext, useEffect, useState } from 'react';

import { ConnectionProvider } from '@solana/wallet-adapter-react';
import { Cluster } from '@solana/web3.js';
import RPC_ENDPOINTS from 'configs/rpc_endpoints.json';
import { useRouter } from 'next/router';

export type UrlBuilder = {
	buildHomeUrl: () => string;
	buildCreateContractUrl: () => string;
	buildContractSummaryUrl: (string) => string;
};

const CLUSTER_PARAM_KEY = 'cluster';
const SUPPORTED_CLUSTERS: Cluster[] = ['devnet', 'mainnet-beta'];
const DEFAULT_CLUSTER: Cluster = 'devnet';

export const UrlProviderContext = createContext<UrlBuilder>(undefined);

export const UrlProviderProvider = ({ children }) => {
	const { query } = useRouter();
	const clusterParam = query[CLUSTER_PARAM_KEY];

	// initialized to the default cluster connection
	const [endpoint, setEndpoint] = useState(getClusterEndpoint(DEFAULT_CLUSTER));

	// change the connection endpoint everytime the cluster query param changes
	useEffect(() => {
		let newEndpoint = getClusterEndpoint(DEFAULT_CLUSTER);

		clusterParam as Cluster;

		if (clusterParam) {
			if (SUPPORTED_CLUSTERS.includes(clusterParam as Cluster)) {
				newEndpoint = getClusterEndpoint(clusterParam as Cluster);
			} else {
				console.warn('cluster selected not supported, fallback to the default');
			}
		}

		console.log('set connection endpoint to: ', newEndpoint);
		setEndpoint(newEndpoint);
	}, [clusterParam]);

	const checkForClusterParam = (url: string): string => {
		if (query[CLUSTER_PARAM_KEY]) {
			if (SUPPORTED_CLUSTERS.includes(clusterParam as Cluster)) {
				// TODO improve
				return url + '?' + CLUSTER_PARAM_KEY + '=' + clusterParam;
			} else {
				return url;
			}
		} else {
			return url;
		}
	};

	const buildHomeUrl = (): string => {
		let url = '/';
		url = checkForClusterParam(url);
		return url;
	};

	const buildContractSummaryUrl = (contractAddress: string): string => {
		let url = `/contract/summary/${contractAddress}`;
		url = checkForClusterParam(url);
		return url;
	};

	const buildCreateContractUrl = (): string => {
		let url = '/contract/create';
		url = checkForClusterParam(url);
		return url;
	};

	const urlBuilder: UrlBuilder = {
		buildHomeUrl,
		buildContractSummaryUrl,
		buildCreateContractUrl
	};

	return (
		<UrlProviderContext.Provider value={urlBuilder}>
			<ConnectionProvider endpoint={endpoint}>{children}</ConnectionProvider>{' '}
		</UrlProviderContext.Provider>
	);
};

function getClusterEndpoint(cluster: Cluster): any {
	const endpoint = RPC_ENDPOINTS.find((c) => {
		return c.cluster === cluster;
	}).endpoints[0];

	return endpoint;
}
