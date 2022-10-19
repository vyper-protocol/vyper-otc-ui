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

		const d = new Date();
		d.setDate(d.getDate() - 5);
		const nd = new Date(d);

		r.gte.push({ column: 'settle_available_from', value: nd.toUTCString() });
		r.eq.push({ column: 'cluster', value: cluster });
		return r;
	}
}
