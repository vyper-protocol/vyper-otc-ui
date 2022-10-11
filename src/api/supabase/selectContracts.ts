/* eslint-disable no-console */
/* eslint-disable camelcase */
import { PublicKey } from '@solana/web3.js';
import { FetchContractsParams } from 'controllers/fetchContracts/FetchContractsParams';
import { ChainOtcState } from 'models/ChainOtcState';
import { DbOtcState } from 'models/DbOtcState';

import { CONTRACTS_METADATA_TABLE_NAME, CONTRACTS_TABLE_NAME, supabase } from './client';

export const selectContracts = async (params: FetchContractsParams): Promise<DbOtcState[]> => {
	const query = supabase.from(CONTRACTS_TABLE_NAME).select(
		`
			        *,
			        ${CONTRACTS_METADATA_TABLE_NAME} (
			            *
			        )
			    `
	);

	params.lte.forEach((f) => query.lte(f.column, f.value));
	params.gte.forEach((f) => query.gte(f.column, f.value));
	params.gt.forEach((f) => query.gt(f.column, f.value));
	params.lt.forEach((f) => query.lt(f.column, f.value));

	const res = await query;

	if (res.error) throw Error(res.error.message);

	return res.data.map<DbOtcState>((c) => DbOtcState.fromSupabaseSelectRes(c));
};
