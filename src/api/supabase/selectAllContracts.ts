/* eslint-disable no-console */
import { getCurrentCluster } from 'components/providers/OtcConnectionProvider';
import { AVAILABLE_PAYOFF_TYPE_IDS, AVAILABLE_RATE_TYPE_IDS } from 'models/common';
import { DbOtcState } from 'models/DbOtcState';

import { CONTRACTS_DYNAMIC_DATA_TABLE_NAME, CONTRACTS_METADATA_TABLE_NAME, CONTRACTS_TABLE_NAME, supabase } from './client';

export const selectAllContracts = async (): Promise<DbOtcState[]> => {
	const query = supabase.from(CONTRACTS_TABLE_NAME).select(
		`
			        *,
			        ${CONTRACTS_METADATA_TABLE_NAME}(*),
					ignore:${CONTRACTS_DYNAMIC_DATA_TABLE_NAME}!inner(*),
			        ${CONTRACTS_DYNAMIC_DATA_TABLE_NAME}(*)
		`
	);

	// CONSTANTS FILTERING
	query.eq('cluster', getCurrentCluster());
	query.in('redeem_logic_plugin_type', AVAILABLE_PAYOFF_TYPE_IDS as any);
	query.in('rate_plugin_type', AVAILABLE_RATE_TYPE_IDS as any);

	// * * * * * * * * * * * * *

	const res = await query;

	if (res.error) {
		console.error(res.error);
		throw Error(res.error.message);
	}

	return res.data.map<DbOtcState>((c) => DbOtcState.createFromDBData(c));
};
