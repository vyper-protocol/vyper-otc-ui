import { Address, AnchorProvider } from '@project-serum/anchor';
import { Connection, PublicKey } from '@solana/web3.js';
import { fetchContract } from 'controllers/fetchContract';
import { ChainOtcState } from 'models/ChainOtcState';
import { useQuery, UseQueryResult } from 'react-query';

/**
 * Get the query to fetch an OTC state
 * @param provider AnchorProvider with connection and user wallet
 * @param otcState public key for the otc state
 * @returns query for the otc state
 */
export const useGetFetchOTCStateQuery = (connection: Connection, otcState: Address): UseQueryResult<ChainOtcState> => {
	return useQuery<ChainOtcState>(
		['otc-state', otcState, connection.rpcEndpoint],
		() => {
			if (otcState !== undefined) return fetchContract(connection, new PublicKey(otcState));
		},
		{
			// 5min
			cacheTime: 5 * 60 * 1000,
			refetchOnWindowFocus: false,
			refetchOnMount: false,
			refetchOnReconnect: false,
			// refetchInterval: 5000
			// 2 min
			staleTime: 2 * 60 * 1000
		}
	);
};
