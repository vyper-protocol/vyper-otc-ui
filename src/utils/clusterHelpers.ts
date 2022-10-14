import { Cluster } from '@solana/web3.js';
import ENDPOINTS from 'configs/endpoints.json';

export const getClusterFromRpcEndpoint = (rpcEndpoint: string): Cluster => {
	return ENDPOINTS.find((c) => c.rpcEndpoint === rpcEndpoint).cluster as Cluster;
};
