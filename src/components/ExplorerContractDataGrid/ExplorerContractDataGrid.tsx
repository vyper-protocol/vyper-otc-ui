import { useState, useEffect, useCallback, useRef } from 'react';

import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { Box, CircularProgress } from '@mui/material';
import {
	DataGrid,
	GridColumns,
	GridRowParams,
	GridRenderCellParams,
	GridActionsCellItem,
	GridFilterModel,
	GridSortModel,
	getGridStringOperators,
	getGridSingleSelectOperators
} from '@mui/x-data-grid';
import { useConnection } from '@solana/wallet-adapter-react';
import { getExplorerLink } from '@vyper-protocol/explorer-link-helper';
import ContractStatusBadge from 'components/ContractStatusBadge';
import MomentTooltipSpan from 'components/MomentTooltipSpan';
import { getCurrentCluster } from 'components/providers/OtcConnectionProvider';
import PublicKeyLink from 'components/PublicKeyLink';
import StatusBadge from 'components/StatusBadge';
import fetchContracts from 'controllers/fetchContracts';
import {
	cleanParams,
	FetchContractsParams,
	fromFilterModel,
	fromSortModel,
	QueryParams,
	toFilterModel,
	toSortModel,
	transformParams
} from 'controllers/fetchContracts/FetchContractsParams';
import { AVAILABLE_CONTRACT_STATUS_IDS } from 'models/ChainOtcState';
import { AVAILABLE_PAYOFF_TYPE_IDS, PayoffTypeIds } from 'models/common';
import { DbOtcState } from 'models/DbOtcState';
import { Digital } from 'models/plugins/payoff/Digital';
import { Forward } from 'models/plugins/payoff/Forward';
import { SettledForward } from 'models/plugins/payoff/SettledForward';
import { VanillaOption } from 'models/plugins/payoff/VanillaOption';
import { useRouter } from 'next/router';
import * as UrlBuilder from 'utils/urlBuilder';

import OracleLivePrice from '../OracleLivePrice';

// @ts-ignore
BigInt.prototype.toJSON = function () {
	return this.toString();
};

type Props = {
	query: QueryParams;
	count: number;
};

const ExplorerContractDataGrid = ({ query, count }: Props) => {
	const { page, limit, sort, filter } = query;

	const { connection } = useConnection();
	const router = useRouter();

	const [contractsLoading, setContractsLoading] = useState(false);
	const [contracts, setContracts] = useState<DbOtcState[]>([]);

	const [explorerPage, setExplorerPage] = useState(page || 1);
	const [explorerLimit, setExplorerLimit] = useState(limit || 25);
	const [filterModel, setFilterModel] = useState<GridFilterModel | null>(filter ? toFilterModel(filter) : null);
	const [sortModel, setSortModel] = useState<GridSortModel | null>(sort ? toSortModel(sort) : null);

	const explorerPageRef = useRef(true);
	const explorerStateRef = useRef(true);

	const updateQueryParams = useCallback(() => {
		const updatedQueryParams = transformParams({
			filter: fromFilterModel(filterModel),
			sort: fromSortModel(sortModel),
			page: explorerPage,
			limit: explorerLimit
		});
		const updatedQuery = cleanParams(updatedQueryParams);

		router.push({
			pathname: '/explorer',
			query: updatedQuery
		});
	}, [router, explorerPage, explorerLimit, filterModel, sortModel]);

	useEffect(() => {
		setContractsLoading(true);
		setContracts([]);

		const fetchContractsParams = FetchContractsParams.build(getCurrentCluster(), query);
		fetchContracts(fetchContractsParams)
			.then((c) => setContracts(c))
			.finally(() => setContractsLoading(false));
	}, [connection, query]);

	useEffect(() => {
		if (explorerPageRef.current) {
			explorerPageRef.current = false;
			return;
		}

		// When explorer page is updated, update the query params
		updateQueryParams();
		// eslint-disable-next-line
	}, [explorerPage]);

	useEffect(() => {
		if (explorerStateRef.current) {
			explorerStateRef.current = false;
			return;
		}

		setExplorerPage((prevPage) => {
			if (prevPage === 1) {
				updateQueryParams();
			}

			return 1;
		});
		// eslint-disable-next-line
	}, [explorerLimit, sortModel]);

	const columns: GridColumns<DbOtcState> = [
		{
			type: 'singleSelect',
			field: 'redeemLogicState.typeId',
			headerName: 'Instrument',
			flex: 1,
			minWidth: 150,
			valueOptions: AVAILABLE_PAYOFF_TYPE_IDS as any,
			sortable: true,
			filterable: true,
			renderCell: (params: GridRenderCellParams<string>) => <StatusBadge label={params.value} mode="dark" />,
			valueGetter: (params) => {
				return (params.row as DbOtcState).redeemLogicAccount.state.payoffId;
			},
			filterOperators: getGridSingleSelectOperators().filter((op) => op.value === 'isAnyOf')
		},
		{
			type: 'string',
			field: 'underlying',
			headerName: 'Underlying',
			flex: 1,
			minWidth: 150,
			sortable: true,
			filterable: true,
			valueGetter: (params) => {
				return params.row.dynamicData?.title ?? 'NA';
			},
			filterOperators: getGridStringOperators().filter((op) => op.value === 'equals')
		},
		{
			type: 'number',
			field: 'redeemLogicState.notional',
			headerName: 'Size',
			flex: 1,
			minWidth: 100,
			sortable: true,
			filterable: true,
			valueGetter: (params) => {
				const rlState = params.row.redeemLogicAccount.state;
				switch (rlState.payoffId as PayoffTypeIds) {
					case 'forward':
						return (rlState as Forward).notional;
					case 'settled_forward':
						return (rlState as SettledForward).notional;
					case 'vanilla_option':
						return (rlState as VanillaOption).notional;
					// TODO: find common columns
					case 'digital':
					default:
						return '-';
				}
			}
		},
		{
			type: 'number',
			field: 'redeemLogicState.strike',
			headerName: 'Strike',
			flex: 1,
			minWidth: 100,
			sortable: true,
			filterable: true,
			valueGetter: (params) => {
				const rlState = params.row.redeemLogicAccount.state;
				switch (rlState.payoffId as PayoffTypeIds) {
					case 'forward':
						return (rlState as Forward).strike;
					case 'settled_forward':
						return (rlState as SettledForward).strike;
					case 'vanilla_option':
						return (rlState as VanillaOption).strike;
					case 'digital':
						return (rlState as Digital).strike;
					default:
						return '-';
				}
			}
		},
		{
			type: 'number',
			field: 'rateState.aggregatorLastValue',
			headerName: 'Current Price',
			sortable: false,
			filterable: false,
			renderCell: (params: GridRenderCellParams<any>) => (
				<OracleLivePrice
					oracleType={(params.row as DbOtcState).rateAccount.state.rateId}
					pubkey={(params.row as DbOtcState).rateAccount.state.livePriceAccounts[0].toBase58()}
				/>
			),
			flex: 1,
			minWidth: 125
		},
		{
			field: 'settleAvailableFromAt',
			type: 'dateTime',
			headerName: 'Expiry',
			renderCell: (params: GridRenderCellParams<number>) => <MomentTooltipSpan datetime={params.value} />,
			sortable: true,
			filterable: true,
			flex: 1,
			minWidth: 100
		},
		{
			field: 'createdAt',
			type: 'dateTime',
			headerName: 'Created at',
			renderCell: (params: GridRenderCellParams<number>) => <MomentTooltipSpan datetime={params.value} />,
			sortable: true,
			filterable: true,
			flex: 1,
			minWidth: 100
		},
		{
			type: 'boolean',
			field: 'buyerFunded',
			headerName: 'Long funded',
			sortable: true,
			filterable: true,
			flex: 1,
			minWidth: 100,
			valueGetter: (params) => {
				return params.row.isLongFunded();
			}
		},
		{
			type: 'boolean',
			field: 'sellerFunded',
			headerName: 'Short funded',
			sortable: true,
			filterable: true,
			flex: 1,
			minWidth: 100,
			valueGetter: (params) => {
				return params.row.isShortFunded();
			}
		},
		{
			field: 'buyerWallet',
			headerName: 'Buyer wallet',
			sortable: true,
			filterable: true,
			flex: 1,
			minWidth: 50,
			renderCell: (params) => {
				if (!params.row.dynamicData?.buyerWallet) return <></>;
				return <PublicKeyLink address={params.row.dynamicData?.buyerWallet} />;
			},
			filterOperators: getGridStringOperators().filter((op) => op.value === 'equals' || op.value === 'isAnyOf')
		},
		{
			field: 'sellerWallet',
			headerName: 'Seller wallet',
			sortable: true,
			filterable: true,
			flex: 1,
			minWidth: 50,
			renderCell: (params) => {
				if (!params.row.dynamicData?.sellerWallet) return <></>;
				return <PublicKeyLink address={params.row.dynamicData?.sellerWallet} />;
			},
			filterOperators: getGridStringOperators().filter((op) => op.value === 'equals' || op.value === 'isAnyOf')
		},
		{
			type: 'singleSelect',
			valueOptions: AVAILABLE_CONTRACT_STATUS_IDS as any,
			field: 'contractStatus',
			headerName: 'Status',
			flex: 1,
			minWidth: 100,
			sortable: false,
			filterable: false,
			renderCell: (params) => {
				return <ContractStatusBadge status={params.row.contractStatus} />;
			}
		},
		{
			field: 'actions',
			type: 'actions',
			headerName: 'Show details',
			flex: 1,
			getActions: (params: GridRowParams) => [
				<GridActionsCellItem
					key="open"
					icon={<OpenInNewIcon />}
					onClick={() => window.open(window.location.origin + UrlBuilder.buildContractSummaryUrl(params.id.toString()))}
					label="Open"
				/>,
				<GridActionsCellItem
					key="open_in_explorer"
					icon={<OpenInNewIcon />}
					onClick={() => window.open(getExplorerLink(params.id.toString(), { explorer: 'solana-explorer', cluster: getCurrentCluster() }))}
					label="Open in Explorer"
					showInMenu
				/>,
				<GridActionsCellItem
					key="open_in_solscan"
					icon={<OpenInNewIcon />}
					onClick={() => window.open(getExplorerLink(params.id.toString(), { explorer: 'solscan', cluster: getCurrentCluster() }))}
					label="Open in Solscan"
					showInMenu
				/>
			]
		}
	];

	return (
		<>
			{contractsLoading ? (
				<CircularProgress />
			) : (
				<Box sx={{ maxWidth: 1600, width: '90%' }}>
					<DataGrid
						pagination
						autoHeight
						paginationMode="server"
						filterMode="server"
						sortingMode="server"
						page={explorerPage - 1}
						pageSize={explorerLimit}
						getRowId={(row) => row.publickey.toBase58()}
						rows={contracts}
						rowCount={count}
						columns={columns}
						filterModel={filterModel}
						sortModel={sortModel}
						// Material UI page starts from 0
						onPreferencePanelClose={() => {
							if (explorerPage === 1) {
								updateQueryParams();
							} else {
								setExplorerPage(1);
							}
						}}
						onPageChange={(newPage) => setExplorerPage(newPage + 1)}
						onPageSizeChange={(newLimit) => setExplorerLimit(newLimit)}
						onFilterModelChange={(newFilterModel) => setFilterModel(newFilterModel)}
						onSortModelChange={(newSortModel) => setSortModel(newSortModel)}
					/>
				</Box>
			)}
		</>
	);
};

export default ExplorerContractDataGrid;
