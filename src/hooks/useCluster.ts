/* eslint-disable indent */
import { useEffect, useState } from 'react';

import RPC_ENDPOINTS from 'configs/rpc_endpoints.json';
import { useRouter } from 'next/router';

export const DEFAULT_CLUSTER = 'devnet';

export const useCluster = () => {
	const router = useRouter();

	const { cluster } = router.query;

	const [currectCluster, setCurrentCluster] = useState(DEFAULT_CLUSTER);

	useEffect(() => {
		switch (cluster) {
			case 'mainnet-beta':
				setCurrentCluster('mainnet-beta');
				break;
			case 'devnet':
				setCurrentCluster('devnet');
				break;
			default:
				setCurrentCluster(DEFAULT_CLUSTER);
				break;
		}
	}, [cluster]);

	const endpoint = RPC_ENDPOINTS.find((c) => {
		return c.cluster === currectCluster;
	}).endpoints[0];

	return { cluster: currectCluster, endpoint };
};
