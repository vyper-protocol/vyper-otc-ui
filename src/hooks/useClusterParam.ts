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

		console.group('useClusterParams');
		console.log('cluster: ', cluster);

		switch (cluster) {
			case 'devnet':
				console.log('switch devnet');
				console.log(url);
				console.groupEnd();
				return url;
			case 'mainnet-beta':
				if (url.search.split('cluster').length !== 2) {
					url.searchParams.append('cluster', cluster);
					console.log('url has not params yet');
					console.log(url.search.split('search'));
				}
				console.log('switch mainnet-beta');
				console.log(url);
				console.groupEnd();
				return url;
			default:
				return url;
		}
	}
};
