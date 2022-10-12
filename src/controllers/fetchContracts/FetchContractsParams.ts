import { Cluster } from '@solana/web3.js';

type SupabaseColumnFilter = {
	column: string | number;
	value: any;
};

export class FetchContractsParams {
	lte: SupabaseColumnFilter[] = [];
	lt: SupabaseColumnFilter[] = [];
	gte: SupabaseColumnFilter[] = [];
	gt: SupabaseColumnFilter[] = [];
	eq: SupabaseColumnFilter[] = [];

	static buildNotExpiredContractsQuery(cluster: Cluster): FetchContractsParams {
		const r = new FetchContractsParams();
		r.gte.push({ column: 'settle_available_from', value: new Date().toUTCString() });
		r.eq.push({ column: 'cluster', value: cluster });
		return r;
	}
}
