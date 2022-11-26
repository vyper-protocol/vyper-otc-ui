import { GridSortModel } from '@mui/x-data-grid';
import { Cluster } from '@solana/web3.js';
import { AVAILABLE_RL_TYPES } from 'models/plugins/redeemLogic/RLStateType';

export type QueryParams = {
	page?: number;
	limit?: number;
	sort?: SupabaseColumnOrder[];
	instrument?: typeof AVAILABLE_RL_TYPES;
};

export const fromSortModel = (model: GridSortModel): SupabaseColumnOrder[] => {
	return model.filter((m) => ['asc', 'desc'].includes(m.sort)).map((m) => [m.field, m.sort]);
};

export const toSortModel = (sort: SupabaseColumnOrder[]): GridSortModel => {
	return sort.map((s) => ({
		field: s[0],
		sort: s[1]
	}));
};

export const transformSortParams = (orders: SupabaseColumnOrder[]): string => {
	return orders.reduce((accumulator, current, i) => {
		accumulator += accumulator + current[0] + ' ' + current[1];
		if (i !== orders.length - 1) {
			accumulator += ',';
		}

		return accumulator;
	}, '');
};

export const transformParams = (params: QueryParams): { [key: string]: string } => {
	const transformedParams = Object.entries(params).reduce((acc, [key, value]) => {
		if (value !== undefined) {
			acc[key] = key === 'sort' ? transformSortParams(value as SupabaseColumnOrder[]) : value;
		}

		return acc;
	}, {});

	return transformedParams;
};

export const cleanParams = (params: { [key: string]: string }): { [key: string]: string } => {
	return Object.entries(params).reduce((acc, [key, value]) => {
		acc[key] = value;
		if (!value) {
			delete acc[key];
		}

		return acc;
	}, {});
};

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
	range: [number, number];

	static buildNotExpiredContractsQuery(cluster: Cluster, query: QueryParams, isCount?: boolean): FetchContractsParams {
		const r = new FetchContractsParams();

		const d = new Date();
		d.setDate(d.getDate() - 5);
		const nd = new Date(d);

		r.gte.push({ column: 'settle_available_from', value: nd.toUTCString() });
		r.eq.push({ column: 'cluster', value: cluster });

		if (!isCount) {
			const { page = 1, limit = 25 } = query;

			const start = (page - 1) * limit;
			const end = start + limit - 1;
			r.range = [start, end];
		}

		return r;
	}
}
