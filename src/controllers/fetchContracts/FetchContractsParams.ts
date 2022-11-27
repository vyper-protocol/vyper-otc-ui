import { GridFilterModel, GridLinkOperator, GridSortModel } from '@mui/x-data-grid';
import { Cluster } from '@solana/web3.js';

export enum ExplorerFilterOperator {
	Is = 'is',
	IsNot = 'isnot',
	In = 'in',
	Eq = 'eq',
	Neq = 'neq',
	Gt = 'gt',
	Gte = 'gte',
	Lt = 'lt',
	Lte = 'lte',
	After = 'after',
	OnOrAfter = 'onOrAfter',
	Before = 'before',
	OnOrBefore = 'onOrBefore'
}

export type ExplorerFilter = {
	key: string;
	value: any;
	operator: ExplorerFilterOperator;
};

export type QueryParams = {
	page?: number;
	limit?: number;
	sort?: SupabaseColumnOrder[];
	filter?: ExplorerFilter[];
};

export const parseExplorerFilterOperator = (operator: string): ExplorerFilterOperator | undefined => {
	if (operator === 'is') {
		return ExplorerFilterOperator.Is;
	} else if (operator === 'isnot') {
		return ExplorerFilterOperator.IsNot;
	} else if (operator === 'eq') {
		return ExplorerFilterOperator.Eq;
	} else if (operator === 'neq') {
		return ExplorerFilterOperator.Neq;
	} else if (operator === 'gt') {
		return ExplorerFilterOperator.Gt;
	} else if (operator === 'gte') {
		return ExplorerFilterOperator.Gte;
	} else if (operator === 'lt') {
		return ExplorerFilterOperator.Lt;
	} else if (operator === 'lte') {
		return ExplorerFilterOperator.Lte;
	} else if (operator === 'in') {
		return ExplorerFilterOperator.In;
	} else if (operator === 'after') {
		return ExplorerFilterOperator.After;
	} else if (operator === 'onOrAfter') {
		return ExplorerFilterOperator.OnOrAfter;
	} else if (operator === 'before') {
		return ExplorerFilterOperator.Before;
	} else if (operator === 'onOrBefore') {
		return ExplorerFilterOperator.OnOrBefore;
	}

	return undefined;
};

export const fromFilterModel = (model: GridFilterModel): ExplorerFilter[] => {
	return model.items.map((item) => {
		let operator: ExplorerFilterOperator | undefined;
		switch (item.operatorValue) {
			case 'is':
				operator = ExplorerFilterOperator.Is;
				break;
			case 'not':
				operator = ExplorerFilterOperator.IsNot;
				break;
			case 'isAnyOf':
				operator = ExplorerFilterOperator.In;
				break;
			case '=':
				operator = ExplorerFilterOperator.Eq;
				break;
			case '>':
				operator = ExplorerFilterOperator.Gt;
				break;
			case '>=':
				operator = ExplorerFilterOperator.Gte;
				break;
			case '<':
				operator = ExplorerFilterOperator.Lt;
				break;
			case '<=':
				operator = ExplorerFilterOperator.Lte;
				break;
			case 'after':
				operator = ExplorerFilterOperator.After;
				break;
			case 'onOrAfter':
				operator = ExplorerFilterOperator.OnOrAfter;
				break;
			case 'before':
				operator = ExplorerFilterOperator.Before;
				break;
			case 'onOrBefore':
				operator = ExplorerFilterOperator.OnOrBefore;
				break;
		}

		return {
			key: item.columnField,
			value: item.value,
			operator
		};
	});
};

export const toFilterModel = (filter: ExplorerFilter[]): GridFilterModel => {
	return {
		items: filter.map((f, i) => {
			const { key: columnField, value } = f;

			let operatorValue: string | undefined;
			switch (f.operator) {
				case ExplorerFilterOperator.Is:
					operatorValue = 'is';
					break;
				case ExplorerFilterOperator.IsNot:
					operatorValue = 'not';
					break;
				case ExplorerFilterOperator.In:
					operatorValue = 'isAnyOf';
					break;
				case ExplorerFilterOperator.Eq:
					operatorValue = '=';
					break;
				case ExplorerFilterOperator.Gt:
					operatorValue = '>';
					break;
				case ExplorerFilterOperator.Gte:
					operatorValue = '>=';
					break;
				case ExplorerFilterOperator.Lt:
					operatorValue = '<';
					break;
				case ExplorerFilterOperator.Lte:
					operatorValue = '<=';
					break;
				case ExplorerFilterOperator.After:
					operatorValue = 'after';
					break;
				case ExplorerFilterOperator.OnOrAfter:
					operatorValue = 'onOrAfter';
					break;
				case ExplorerFilterOperator.Before:
					operatorValue = 'before';
					break;
				case ExplorerFilterOperator.OnOrBefore:
					operatorValue = 'onOrBefore';
					break;
			}

			return {
				id: i,
				columnField,
				value,
				operatorValue
			};
		}),
		linkOperator: GridLinkOperator.And,
		quickFilterLogicOperator: GridLinkOperator.And
	};
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
			if (key === 'sort') {
				acc[key] = transformSortParams(value as SupabaseColumnOrder[]);
			} else if (key === 'filter') {
				const filters = value as ExplorerFilter[];
				for (const filter of filters) {
					if ((Array.isArray(filter.value) && filter.value.length > 0) || (!Array.isArray(filter.value) && filter.value !== undefined)) {
						acc[filter.key] = filter.value + ' ' + filter.operator;
					} else {
						delete acc[filter.key];
					}
				}
			} else {
				acc[key] = value;
			}
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

export const toSupabaseColumn = (key: string): string | null => {
	if (key === 'redeemLogicState.typeId') {
		return 'redeem_logic_plugin_type';
	} else if (key === 'redeemLogicState.notional') {
		return 'redeem_logic_plugin_data->notional';
	} else if (key === 'redeemLogicState.strike') {
		return 'redeem_logic_plugin_data->strike';
	} else if (key === 'settleAvailableFromAt') {
		return 'settle_available_from';
	}

	return null;
};

export const toSupabaseValue = (column: string, value: any): any => {
	if (column === 'settle_available_from') {
		return new Date(value).toUTCString();
	}

	return value;
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
	neq: SupabaseColumnFilter[] = [];
	in: SupabaseColumnFilter[] = [];
	order: SupabaseColumnOrder[] = [];
	range: [number, number];

	static buildNotExpiredContractsQuery(cluster: Cluster, query: QueryParams, isCountQuery?: boolean): FetchContractsParams {
		const r = new FetchContractsParams();

		const d = new Date();
		d.setDate(d.getDate() - 5);
		const nd = new Date(d);

		r.gte.push({ column: 'settle_available_from', value: nd.toUTCString() });
		r.eq.push({ column: 'cluster', value: cluster });

		if (query.sort) {
			r.order = query.sort.map(([key, value]) => [toSupabaseColumn(key), value]);
		}

		if (query.filter) {
			for (const { key, value, operator } of query.filter) {
				const column = toSupabaseColumn(key);

				switch (operator) {
					case ExplorerFilterOperator.Is:
					case ExplorerFilterOperator.Eq:
						r.eq.push({ column, value });
						break;
					case ExplorerFilterOperator.IsNot:
					case ExplorerFilterOperator.Neq:
						r.neq.push({ column, value });
						break;
					case ExplorerFilterOperator.Gt:
					case ExplorerFilterOperator.After:
						r.gt.push({ column, value });
						break;
					case ExplorerFilterOperator.Gte:
					case ExplorerFilterOperator.OnOrAfter:
						r.gte.push({ column, value });
						break;
					case ExplorerFilterOperator.Lt:
					case ExplorerFilterOperator.Before:
						r.lt.push({ column, value });
						break;
					case ExplorerFilterOperator.Lte:
					case ExplorerFilterOperator.OnOrBefore:
						r.lte.push({ column, value });
						break;
					case ExplorerFilterOperator.In:
						if (Array.isArray(value)) {
							r.in.push({ column, value });
						}
						break;
				}
			}
		}

		if (!isCountQuery) {
			const { page = 1, limit = 25 } = query;

			const start = (page - 1) * limit;
			const end = start + limit - 1;
			r.range = [start, end];
		}

		return r;
	}
}
