import { useState, useEffect, useCallback } from 'react';

import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { Box, CircularProgress } from '@mui/material';
import { DataGrid, GridColumns, GridRowParams, GridRenderCellParams, GridActionsCellItem, GridFilterModel } from '@mui/x-data-grid';
import { useConnection } from '@solana/wallet-adapter-react';
import { getExplorerLink } from '@vyper-protocol/explorer-link-helper';
import StatusBadge from 'components/atoms/StatusBadge';
import ContractStatusBadge from 'components/molecules/ContractStatusBadge';
import MomentTooltipSpan from 'components/molecules/MomentTooltipSpan';
import PublicKeyLink from 'components/molecules/PublicKeyLink';
import { getCurrentCluster } from 'components/providers/OtcConnectionProvider';
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
import { AVAILABLE_CONTRACT_STATUS_IDS, ChainOtcState } from 'models/ChainOtcState';
import { RLDigital } from 'models/plugins/redeemLogic/digital/RLDigital';
import { RLForward } from 'models/plugins/redeemLogic/forward/RLForward';
import { AVAILABLE_RL_TYPES, RLPluginTypeIds } from 'models/plugins/redeemLogic/RLStateType';
import { RLSettledForward } from 'models/plugins/redeemLogic/settledForward/RLSettledForward';
import { RLVanillaOption } from 'models/plugins/redeemLogic/vanillaOption/RLVanillaOption';
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
	const { page = 1, limit = 25, sort, filter } = query;

	const { connection } = useConnection();
	const router = useRouter();

	const [contractsLoading, setContractsLoading] = useState(false);
	const [contracts, setContracts] = useState<ChainOtcState[]>([]);
	const [filterModel, setFilterModel] = useState<GridFilterModel | null>(filter ? toFilterModel(filter) : null);

	const updateQueryParams = useCallback(
		(updatedQueryParams: QueryParams, resetPagination?: boolean) => {
			const updatedQuery = cleanParams(transformParams(updatedQueryParams));

			if (resetPagination) {
				updatedQuery.page = '1';
			}

			router.push({
				pathname: '/explorer',
				query: updatedQuery
			});
		},
		[router]
	);

	useEffect(() => {
		setContractsLoading(true);
		setContracts([]);

		const fetchContractsParams = FetchContractsParams.buildNotExpiredContractsQuery(getCurrentCluster(), query);
		fetchContracts(connection, fetchContractsParams)
			.then((c) => setContracts(c))
			.finally(() => setContractsLoading(false));
	}, [connection, query]);

	const columns: GridColumns<ChainOtcState> = [
		{
			type: 'singleSelect',
			field: 'redeemLogicState.typeId',
			headerName: 'Instrument',
			flex: 1,
			minWidth: 150,
			valueOptions: AVAILABLE_RL_TYPES as any,
			sortable: true,
			filterable: true,
			renderCell: (params: GridRenderCellParams<string>) => <StatusBadge label={params.value} mode="dark" />,
			valueGetter: (params) => {
				return (params.row as ChainOtcState).redeemLogicAccount.state.getTypeLabel();
			}
		},
		{
			type: 'string',
			field: 'rateState.title',
			headerName: 'Underlying',
			flex: 1,
			minWidth: 150,
			sortable: false,
			filterable: false,
			valueGetter: (params) => {
				return params.row.rateAccount.state.title;
			}
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
				switch (rlState.stateType.type as RLPluginTypeIds) {
					case 'forward':
						return (rlState as RLForward).notional;
					case 'settled_forward':
						return (rlState as RLSettledForward).notional;
					case 'vanilla_option':
						return (rlState as RLVanillaOption).notional;
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
				switch (rlState.stateType.type as RLPluginTypeIds) {
					case 'forward':
						return (rlState as RLForward).strike;
					case 'settled_forward':
						return (rlState as RLSettledForward).strike;
					case 'vanilla_option':
						return (rlState as RLVanillaOption).strike;
					case 'digital':
						return (rlState as RLDigital).strike;
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
					oracleType={(params.row as ChainOtcState).rateAccount.state.typeId}
					pubkey={(params.row as ChainOtcState).rateAccount.state.livePriceAccounts[0].toBase58()}
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
			type: 'boolean',
			field: 'buyerFunded',
			headerName: 'Long funded',
			sortable: false,
			filterable: false,
			flex: 1,
			minWidth: 100,
			valueGetter: (params) => {
				return params.row.isBuyerFunded();
			}
		},
		{
			type: 'boolean',
			field: 'sellerFunded',
			headerName: 'Short funded',
			sortable: false,
			filterable: false,
			flex: 1,
			minWidth: 100,
			valueGetter: (params) => {
				return params.row.isSellerFunded();
			}
		},
		{
			field: 'buyerWallet',
			headerName: 'Buyer wallet',
			sortable: false,
			filterable: false,
			flex: 1,
			minWidth: 50,
			renderCell: (params) => {
				if (!params.row.buyerWallet) return <></>;
				return <PublicKeyLink address={params.row.buyerWallet?.toBase58()} />;
			}
		},
		{
			field: 'sellerWallet',
			headerName: 'Seller wallet',
			sortable: false,
			filterable: false,
			flex: 1,
			minWidth: 50,
			renderCell: (params) => {
				if (!params.row.sellerWallet) return <></>;
				return <PublicKeyLink address={params.row.sellerWallet?.toBase58()} />;
			}
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
			{contractsLoading && <CircularProgress />}

			{contracts.length > 0 && (
				<Box sx={{ maxWidth: 1600, width: '90%' }}>
					<DataGrid
						pagination
						autoHeight
						paginationMode="server"
						filterMode="server"
						sortingMode="server"
						page={page - 1}
						pageSize={limit}
						getRowId={(row) => row.publickey.toBase58()}
						rows={contracts}
						rowCount={count}
						columns={columns}
						filterModel={filterModel}
						sortModel={sort ? toSortModel(sort) : undefined}
						// Material UI page starts from 0
						onPreferencePanelClose={() => updateQueryParams({ filter: fromFilterModel(filterModel) }, true)}
						onPageChange={(newPage) => updateQueryParams({ page: newPage + 1 })}
						onPageSizeChange={(newLimit) => updateQueryParams({ limit: newLimit })}
						onSortModelChange={(newSortModel) => updateQueryParams({ sort: fromSortModel(newSortModel) }, true)}
						onFilterModelChange={(newFilterModel) => setFilterModel(newFilterModel)}
					/>
				</Box>
			)}
		</>
	);
};

export default ExplorerContractDataGrid;
