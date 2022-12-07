/* eslint-disable no-console */
import { FetchContractsParams } from 'controllers/fetchContracts/FetchContractsParams';
import { AVAILABLE_PAYOFF_TYPE_IDS, AVAILABLE_RATE_TYPE_IDS } from 'models/common';
import { DbOtcState } from 'models/DbOtcState';

import { CONTRACTS_DYNAMIC_DATA_TABLE_NAME, CONTRACTS_METADATA_TABLE_NAME, CONTRACTS_TABLE_NAME, supabase } from './client';

export const selectContracts = async (params: FetchContractsParams): Promise<DbOtcState[]> => {
	const query = supabase.from(CONTRACTS_TABLE_NAME).select(
		`
			        *,
			        ${CONTRACTS_METADATA_TABLE_NAME}(*),
					ignore:${CONTRACTS_DYNAMIC_DATA_TABLE_NAME}!inner(*),
			        ${CONTRACTS_DYNAMIC_DATA_TABLE_NAME}(*)
		`
	);

	params.lte.forEach((f) => query.lte(f.column, f.value));
	params.gte.forEach((f) => query.gte(f.column, f.value));
	params.gt.forEach((f) => query.gt(f.column, f.value));
	params.lt.forEach((f) => query.lt(f.column, f.value));
	params.eq.forEach((f) => query.eq(f.column, f.value));
	params.is.forEach((f) => query.is(f.column, f.value));
	params.neq.forEach((f) => query.neq(f.column, f.value));
	params.in.forEach((f) => query.in(f.column, f.value));
	params.order.forEach(([col, order]) => {
		query.order(col, { ascending: order === 'asc' });
	});

	// filter for fetching only supported plugins in the UI
	query.in('redeem_logic_plugin_type', AVAILABLE_PAYOFF_TYPE_IDS as any);
	query.in('rate_plugin_type', AVAILABLE_RATE_TYPE_IDS as any);

	query.range(params.range[0], params.range[1]);

	const res = await query;

	if (res.error) {
		console.error(res.error);
		throw Error(res.error.message);
	}

	return res.data.map<DbOtcState>((c) => DbOtcState.createFromDBData(c));
};
