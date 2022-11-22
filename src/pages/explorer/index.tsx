import { useEffect, useState } from 'react';

import ExplorerContractDataGrid, { QueryParams } from 'components/organisms/ExplorerContractDataGrid';
import Layout from 'components/templates/Layout';
import { SupabaseColumnOrder } from 'controllers/fetchContracts/FetchContractsParams';
import { useRouter } from 'next/router';

const ExplorerPage = () => {
	const router = useRouter();
	const [query, setQuery] = useState<QueryParams>({});

	useEffect(() => {
		if (router.isReady) {
			const q = router.query;

			const sort: SupabaseColumnOrder[] = [];
			if (q.sort && typeof q.sort === 'string') {
				for (const val of q.sort.split(',')) {
					const [column, order] = val.split(' ');
					if (order !== 'asc' && order !== 'desc') return;

					sort.push([column, order]);
				}
			}

			setQuery({
				sort,
				page: q.page && typeof q.page === 'string' ? parseInt(q.page, 10) : undefined,
				limit: q.limit && typeof q.limit === 'string' ? parseInt(q.limit, 10) : undefined
			});
		}
	}, [router.isReady, router.query]);

	return (
		<Layout withSearch>
			<ExplorerContractDataGrid query={query} />
		</Layout>
	);
};

export default ExplorerPage;
