import { useCallback, useEffect, useState } from 'react';

import { countContracts } from 'api/supabase/countContracts';
import ExplorerContractDataGrid from 'components/organisms/ExplorerContractDataGrid';
import { getCurrentCluster } from 'components/providers/OtcConnectionProvider';
import Layout from 'components/templates/Layout';
import {
	ExplorerFilter,
	FetchContractsParams,
	SupabaseColumnOrder,
	parseExplorerFilterOperator,
	QueryParams,
	fromExplorerQueryParams
} from 'controllers/fetchContracts/FetchContractsParams';
import { AVAILABLE_RL_TYPES } from 'models/plugins/redeemLogic/RLStateType';
import { useRouter } from 'next/router';

const ExplorerPage = () => {
	const router = useRouter();

	const [loading, setLoading] = useState(true);
	const [query, setQuery] = useState<QueryParams>({});
	const [count, setCount] = useState<number | null>(null);

	const initializeContracts = useCallback((q: { [key: string]: string | string[] }) => {
		const sort: SupabaseColumnOrder[] = [];
		if (q.sort && typeof q.sort === 'string') {
			for (const val of q.sort.split(',')) {
				const [column, order] = val.split(' ');
				if (order !== 'asc' && order !== 'desc') return;

				sort.push([fromExplorerQueryParams(column), order]);
			}
		}

		const filter: ExplorerFilter[] = [];

		// TODO: refactor to avoid code duplication
		if (typeof q['payoff'] === 'string') {
			const values = q['payoff'].split(' ');
			if (values.length === 2) {
				const [value, operator] = values;

				const rlTypes = value.split(',');
				if (rlTypes.every((rlType) => AVAILABLE_RL_TYPES.includes(rlType))) {
					const filterOperator = parseExplorerFilterOperator(operator);
					if (filterOperator !== undefined) {
						filter.push({ key: fromExplorerQueryParams('payoff'), operator: filterOperator, value: rlTypes.length > 1 ? rlTypes : rlTypes[0] });
					}
				}
			}
		}

		if (typeof q['notional'] === 'string') {
			const values = q['notional'].split(' ');
			if (values.length === 2) {
				const [value, operator] = values;

				const notionals = value.split(',').map((val) => parseInt(val, 10));
				const filterOperator = parseExplorerFilterOperator(operator);
				if (filterOperator !== undefined && !notionals.some((notional) => isNaN(notional))) {
					filter.push({ key: fromExplorerQueryParams('notional'), operator: filterOperator, value: notionals.length > 1 ? notionals : notionals[0] });
				}
			}
		}

		if (typeof q['strike'] === 'string') {
			const values = q['strike'].split(' ');
			if (values.length === 2) {
				const [value, operator] = values;

				const strikes = value.split(',').map((val) => parseInt(val, 10));
				const filterOperator = parseExplorerFilterOperator(operator);
				if (filterOperator !== undefined && !strikes.some((strike) => isNaN(strike))) {
					filter.push({ key: fromExplorerQueryParams('strike'), operator: filterOperator, value: strikes.length > 1 ? strikes : strikes[0] });
				}
			}
		}

		if (typeof q['expiry'] === 'string') {
			const values = q['expiry'].split(' ');
			if (values.length === 2) {
				const [value, operator] = values;

				const dates = value.split(',').map((val) => new Date(val).toUTCString());
				const filterOperator = parseExplorerFilterOperator(operator);
				if (filterOperator !== undefined) {
					filter.push({ key: fromExplorerQueryParams('expiry'), operator: filterOperator, value: dates.length > 1 ? dates : dates[0] });
				}
			}
		}

		const updatedQuery: QueryParams = {
			sort,
			filter,
			page: q.page && typeof q.page === 'string' ? parseInt(q.page, 10) : undefined,
			limit: q.limit && typeof q.limit === 'string' ? parseInt(q.limit, 10) : undefined
		};

		const countContractsParams = FetchContractsParams.buildNotExpiredContractsQuery(getCurrentCluster(), updatedQuery, true);
		countContracts(countContractsParams)
			.then((updatedCount) => setCount(updatedCount))
			.then(() => setQuery(updatedQuery))
			.finally(() => setLoading(false));
	}, []);

	useEffect(() => {
		if (router.isReady) {
			initializeContracts(router.query);
		}
	}, [router.isReady, router.query, initializeContracts]);

	return <Layout withSearch>{!loading && count !== null ? <ExplorerContractDataGrid query={query} count={count} /> : null}</Layout>;
};

export default ExplorerPage;
