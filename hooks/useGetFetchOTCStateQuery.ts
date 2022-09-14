import { Address, AnchorProvider } from '@project-serum/anchor';
import { PublicKey } from '@solana/web3.js';
import { fetchOtcState } from 'api/otc-state/fecthOtcState';
import { OtcState } from 'models/OtcState';
import { useQuery, UseQueryResult } from 'react-query';
import { defaultOptions } from 'utils/queries/options';

/**
 * Get the query to fetch an OTC state
 * @param provider AnchorProvider with connection and user wallet
 * @param otcState public key for the otc state
 * @returns query for the otc state
 */
export const useGetFetchOTCStateQuery = (provider: AnchorProvider, otcState: Address): UseQueryResult<OtcState> => {
	return useQuery<OtcState>(
		['otc-state', otcState],
		() => {
			if (otcState != undefined) return fetchOtcState(provider, new PublicKey(otcState));
		},
		defaultOptions('otc-state')
	);
};
