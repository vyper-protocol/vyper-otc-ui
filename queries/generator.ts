import { Address, AnchorProvider } from '@project-serum/anchor';
import { PublicKey } from '@solana/web3.js';
import { queryClient } from 'pages/_app';
import { useQuery, UseQueryResult } from 'react-query';

import { fetchOtcState } from './otc-state/fecthOtcState';
import { OtcState } from '../models/OtcState';

/**
 * Get the query to fetch an OTC state
 * @param provider AnchorProvider with connection and user wallet
 * @param otcState public key for the otc state
 * @returns query for the otc state
 */
export const getFetchOTCStateQuery = (provider: AnchorProvider, otcState: Address): UseQueryResult<OtcState> => {
	return useQuery<OtcState>(
		['otc-state', otcState],
		() => {
			if (otcState != undefined) return fetchOtcState(provider, new PublicKey(otcState));
		},
		defaultOptions('otc-state')
	);
};

/** * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * Default Options
 */

const MILISECONDS = 1000;
const SECONDS = 60;
const MINUTES = 30;

const defaultOptions = (queryKey: string, queryParam?: string) => {
	let placeholder = queryClient.getQueryData<any>(queryKey);
	if (queryParam) {
		placeholder = queryClient.getQueryData<any>(queryKey)?.find((d: any) => {
			return d.id === queryParam;
		});
	}

	return {
		// Set cache time to 30 mins
		cacheTime: MILISECONDS * SECONDS * MINUTES,
		refetchOnWindowFocus: false,
		refetchOnMount: false,
		refetchOnReconnect: false,
		// Provide placeholder data from the cache
		placeholderData: placeholder
	};
};
