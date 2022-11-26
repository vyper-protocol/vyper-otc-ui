import { FetchContractsParams } from 'controllers/fetchContracts/FetchContractsParams';
import { AVAILABLE_RATE_TYPES } from 'models/plugins/rate/RatePluginTypeIds';
import { AVAILABLE_RL_TYPES } from 'models/plugins/redeemLogic/RLStateType';

import { CONTRACTS_METADATA_TABLE_NAME, CONTRACTS_TABLE_NAME, supabase } from './client';

export const countContracts = async (params: FetchContractsParams): Promise<number> => {
	const query = supabase.from(CONTRACTS_TABLE_NAME).select(
		`
			        *,
			        ${CONTRACTS_METADATA_TABLE_NAME} (
			            *
			        )
			    `,
		{ count: 'exact', head: true }
	);

	params.lte.forEach((f) => query.lte(f.column, f.value));
	params.gte.forEach((f) => query.gte(f.column, f.value));
	params.gt.forEach((f) => query.gt(f.column, f.value));
	params.lt.forEach((f) => query.lt(f.column, f.value));
	params.eq.forEach((f) => query.eq(f.column, f.value));
	params.order.forEach(([cols, order]) => {
		query.order(cols, { ascending: order === 'asc' });
	});

	// filter for fetching only supported plugins in the UI
	query.in('redeem_logic_plugin_type', AVAILABLE_RL_TYPES as any);
	query.in('rate_plugin_type', AVAILABLE_RATE_TYPES as any);

	const res = await query;
	if (res.error) throw Error(res.error.message);

	return res.count;
};
