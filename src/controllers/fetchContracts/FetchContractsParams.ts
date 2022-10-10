type SupabaseColumnFilter = {
	column: string | number;
	value: any;
};

export class FetchContractsParams {
	lte: SupabaseColumnFilter[] = [];
	lt: SupabaseColumnFilter[] = [];
	gte: SupabaseColumnFilter[] = [];
	gt: SupabaseColumnFilter[] = [];

	static buildNotExpiredContractsQuery(): FetchContractsParams {
		const r = new FetchContractsParams();
		r.gte.push({ column: 'settle_available_from', value: new Date().toUTCString() });
		return r;
	}
}
