import { Cluster } from '@solana/web3.js';

export type SupabaseColumnFilter = {
	column: string | number;
	value: any;
};

export type SupabaseOrder = 'asc' | 'desc';

// tuple: [column name, ascending / descending]
export type SupabaseColumnOrder = [string, SupabaseOrder];

export class FetchContractsParams {
	lte: SupabaseColumnFilter[] = [];
	lt: SupabaseColumnFilter[] = [];
	gte: SupabaseColumnFilter[] = [];
	gt: SupabaseColumnFilter[] = [];
	eq: SupabaseColumnFilter[] = [];
	order: SupabaseColumnOrder[] = [];

	static buildNotExpiredContractsQuery(cluster: Cluster): FetchContractsParams {
		const r = new FetchContractsParams();

		const d = new Date();
		d.setDate(d.getDate() - 5);
		const nd = new Date(d);

		r.gte.push({ column: 'settle_available_from', value: nd.toUTCString() });
		r.eq.push({ column: 'cluster', value: cluster });
		return r;
	}
}
