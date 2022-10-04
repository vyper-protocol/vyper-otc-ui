/* eslint-disable indent */
import { useState, useEffect } from 'react';

import { useRouter } from 'next/router';

import { useCluster } from './useCluster';

/**
 * This hook takes the base URL according to the .env
 * & re-contructs it with the current cluster as param
 * @returns The current URL reference
 */
export const useClusterParam = (): URL => {
	const router = useRouter();

	const { cluster } = useCluster();

	const [baseUrl, setBaseUrl] = useState<string>('');

	useEffect(() => {
		if (process.env.NODE_ENV === 'development') {
			setBaseUrl(process.env.NEXT_PUBLIC_LOCAL_BASE_URL);
		} else {
			setBaseUrl(process.env.NEXT_PUBLIC_REMOTE_BASE_URL);
		}
	}, []);

	if (baseUrl.length !== 0) {
		const url = new URL(baseUrl + router.asPath);

		switch (cluster) {
			case 'devnet':
				return url;
			case 'mainnet-beta':
				if (url.search.split('search').length !== 2) {
					url.searchParams.append('cluster', cluster);
				}
				return url;
			default:
				return url;
		}
	}
};
