import { Cluster } from '@solana/web3.js';
import RPC_ENDPOINTS from 'configs/rpc_endpoints.json';

export const getClusterFromRpcEndpoint = (rpcEndpoint: string): Cluster => {
	return RPC_ENDPOINTS.find((c) => c.endpoints.includes(rpcEndpoint)).cluster as Cluster;
};
