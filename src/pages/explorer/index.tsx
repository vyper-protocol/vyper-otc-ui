import { useCallback, useEffect, useState } from 'react';

import { CircularProgress } from '@mui/material';
import { countContracts } from 'api/supabase/countContracts';
import ExplorerContractDataGrid, { QueryParams } from 'components/organisms/ExplorerContractDataGrid';
import { getCurrentCluster } from 'components/providers/OtcConnectionProvider';
import Layout from 'components/templates/Layout';
import { FetchContractsParams, SupabaseColumnOrder } from 'controllers/fetchContracts/FetchContractsParams';
import { useRouter } from 'next/router';

const ExplorerPage = () => {
	const router = useRouter();

	const [loading, setLoading] = useState(true);
	const [query, setQuery] = useState<QueryParams>({});
	const [count, setCount] = useState<number | null>(null);

	const initializeContracts = useCallback(async (q: { [key: string]: string | string[] }) => {
		const sort: SupabaseColumnOrder[] = [];
		if (q.sort && typeof q.sort === 'string') {
			for (const val of q.sort.split(',')) {
				const [column, order] = val.split(' ');
				if (order !== 'asc' && order !== 'desc') return;

				sort.push([column, order]);
			}
		}

		const updatedQuery: QueryParams = {
			sort,
			page: q.page && typeof q.page === 'string' ? parseInt(q.page, 10) : undefined,
			limit: q.limit && typeof q.limit === 'string' ? parseInt(q.limit, 10) : undefined
		};

		const updatedCount = await countContracts(FetchContractsParams.buildNotExpiredContractsQuery(getCurrentCluster(), updatedQuery, true));

		setQuery(updatedQuery);
		setCount(updatedCount);
		setLoading(false);
	}, []);

	useEffect(() => {
		if (router.isReady) {
			initializeContracts(router.query);
		}
	}, [router.isReady, router.query, initializeContracts]);

	// TODO: show spinner for the fallback condition instead of null
	return <Layout withSearch>{!loading && count !== null ? <ExplorerContractDataGrid query={query} count={count} /> : <CircularProgress />}</Layout>;
};

export default ExplorerPage;
