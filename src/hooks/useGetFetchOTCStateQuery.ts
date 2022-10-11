import { Address } from '@project-serum/anchor';
import { Connection, PublicKey } from '@solana/web3.js';
import { fetchContract } from 'controllers/fetchContract';
import { ChainOtcState } from 'models/ChainOtcState';
import { useQuery, UseQueryResult } from 'react-query';
import { defaultOptions } from 'utils/queries/options';

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
		defaultOptions('otc-state')
	);
};
