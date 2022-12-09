import { useState, useEffect } from 'react';

import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { Box, Button, Stack } from '@mui/material';
import {
	DataGridPro,
	GridColumns,
	GridRowParams,
	GridRenderCellParams,
	GridActionsCellItem,
	GridFilterModel,
	GridSortModel,
	GridToolbar,
	GridLinkOperator
} from '@mui/x-data-grid-pro';
import { useWallet } from '@solana/wallet-adapter-react';
import { getExplorerLink } from '@vyper-protocol/explorer-link-helper';
import StatusBadge from 'components/atoms/StatusBadge';
import ContractStatusBadge from 'components/molecules/ContractStatusBadge';
import MomentTooltipSpan from 'components/molecules/MomentTooltipSpan';
import PublicKeyLink from 'components/molecules/PublicKeyLink';
import { getCurrentCluster } from 'components/providers/OtcConnectionProvider';
import fetchContracts from 'controllers/fetchContracts';
import { AVAILABLE_CONTRACT_STATUS_IDS } from 'models/ChainOtcState';
import { AVAILABLE_PAYOFF_TYPE_IDS, PayoffTypeIds } from 'models/common';
import { DbOtcState } from 'models/DbOtcState';
import { Digital } from 'models/plugins/payoff/Digital';
import { Forward } from 'models/plugins/payoff/Forward';
import { SettledForward } from 'models/plugins/payoff/SettledForward';
import { VanillaOption } from 'models/plugins/payoff/VanillaOption';
import * as UrlBuilder from 'utils/urlBuilder';

import OracleLivePrice from '../OracleLivePrice';

// import dynamic from 'next/dynamic';
// const DynamicReactJson = dynamic(import('react-json-view'), { ssr: false });

const DEFAULT_FILTER_MODEL: GridFilterModel = {
	items: [
		{
			id: 0,
			columnField: 'contractStatus',
			operatorValue: 'is',
			value: 'active'
		}
	]
};
const DEFAULT_SORT_MODEL: GridSortModel = [{ field: 'createdAt', sort: 'desc' }];

const ExplorerContractDataGrid = () => {
	const [isLoading, setIsLoading] = useState(false);
	const [contracts, setContracts] = useState<DbOtcState[]>([]);

	const wallet = useWallet();

	const [filterModel, setFilterModel] = useState<GridFilterModel>(DEFAULT_FILTER_MODEL);
	const [sortModel, setSortModel] = useState<GridSortModel>(DEFAULT_SORT_MODEL);

	useEffect(() => {
		setIsLoading(true);
		fetchContracts()
			.then((c) => setContracts(c))
			.finally(() => setIsLoading(false));
	}, []);

	const GridHeader = () => {
		return (
			<Stack direction="row">
				<GridToolbar />
				<Button
					onClick={() => {
						setFilterModel(DEFAULT_FILTER_MODEL);
						setSortModel(DEFAULT_SORT_MODEL);
					}}
				>
					Active Contracts
				</Button>
				<Button
					disabled={!wallet.connected}
					onClick={() => {
						setFilterModel({
							items: [
								{
									id: 0,
									columnField: 'dynamicData.buyerWallet',
									operatorValue: 'equals',
									value: wallet.publicKey.toBase58()
								},
								{
									id: 1,
									columnField: 'dynamicData.sellerWallet',
									operatorValue: 'equals',
									value: wallet.publicKey.toBase58()
								}
							],
							linkOperator: GridLinkOperator.Or
						});
						setSortModel(DEFAULT_SORT_MODEL);
					}}
				>
					my contracts
				</Button>
			</Stack>
		);
	};

	const columns: GridColumns<DbOtcState> = [
		{
			field: 'publickey',
			headerName: 'Public Key',
			sortable: true,
			filterable: true,
			flex: 1,
			minWidth: 50,
			renderCell: (params) => {
				return <PublicKeyLink address={params.row.publickey.toBase58()} />;
			}
		},
		{
			type: 'singleSelect',
			field: 'redeemLogicAccount.state.payoffId',
			headerName: 'Instrument',
			flex: 1,
			minWidth: 150,
			valueOptions: AVAILABLE_PAYOFF_TYPE_IDS as any,
			sortable: true,
			filterable: true,
			renderCell: (params: GridRenderCellParams<string>) => <StatusBadge label={params.value} mode="dark" />,
			valueGetter: (params) => {
				return params.row.redeemLogicAccount.state.payoffId;
			}
		},
		{
			type: 'string',
			field: 'dynamicData.title',
			headerName: 'Underlying',
			flex: 1,
			minWidth: 150,
			sortable: true,
			filterable: true,
			valueGetter: (params) => {
				return params.row.dynamicData?.title ?? 'NA';
			}
		},
		{
			type: 'number',
			field: 'redeemLogicAccount.state.notional',
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
			field: 'redeemLogicAccount.state.strike',
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
			field: 'rateAccount.state.aggregatorLastValue',
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
			field: 'depositAvailableFrom',
			type: 'dateTime',
			headerName: 'Deposit start',
			renderCell: (params: GridRenderCellParams<number>) => <MomentTooltipSpan datetime={params.value} />,
			sortable: true,
			filterable: true,
			flex: 1,
			minWidth: 100
		},
		{
			field: 'depositExpirationAt',
			type: 'dateTime',
			headerName: 'Deposit close',
			renderCell: (params: GridRenderCellParams<number>) => <MomentTooltipSpan datetime={params.value} />,
			sortable: true,
			filterable: true,
			flex: 1,
			minWidth: 100
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
			field: 'dynamicData.buyerWallet',
			headerName: 'Buyer wallet',
			sortable: true,
			filterable: true,
			flex: 1,
			minWidth: 50,
			valueGetter: (params) => {
				return params.row.dynamicData?.buyerWallet;
			},
			renderCell: (params) => {
				if (!params.value) return <></>;
				return <PublicKeyLink address={params.value} />;
			}
		},
		{
			field: 'dynamicData.sellerWallet',
			headerName: 'Seller wallet',
			sortable: true,
			filterable: true,
			flex: 1,
			minWidth: 50,
			valueGetter: (params) => {
				return params.row.dynamicData?.sellerWallet;
			},
			renderCell: (params) => {
				if (!params.value) return <></>;
				return <PublicKeyLink address={params.value} />;
			}
		},
		{
			type: 'singleSelect',
			valueOptions: AVAILABLE_CONTRACT_STATUS_IDS as any,
			field: 'contractStatus',
			headerName: 'Status',
			flex: 1,
			minWidth: 100,
			sortable: true,
			filterable: true,
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
					nonce=""
					onResize={() => {
						//
					}}
					onResizeCapture={() => {
						//
					}}
				/>,
				<GridActionsCellItem
					key="open_in_explorer"
					icon={<OpenInNewIcon />}
					onClick={() => window.open(getExplorerLink(params.id.toString(), { explorer: 'solana-explorer', cluster: getCurrentCluster() }))}
					label="Open in Explorer"
					showInMenu
					nonce=""
					onResize={() => {
						//
					}}
					onResizeCapture={() => {
						//
					}}
				/>,
				<GridActionsCellItem
					key="open_in_solscan"
					icon={<OpenInNewIcon />}
					onClick={() => window.open(getExplorerLink(params.id.toString(), { explorer: 'solscan', cluster: getCurrentCluster() }))}
					label="Open in Solscan"
					showInMenu
					nonce=""
					onResize={() => {
						//
					}}
					onResizeCapture={() => {
						//
					}}
				/>
			]
		}
	];

	return (
		<>
			{/* <Stack direction="row" padding={5}>
				<DynamicReactJson src={filterModel} name="filterModel" />
				<DynamicReactJson src={sortModel} name="sortModel" />
			</Stack> */}
			<Box sx={{ maxWidth: 1600, width: '90%' }}>
				<DataGridPro
					pagination
					autoHeight
					loading={isLoading}
					getRowId={(row) => row.publickey.toBase58()}
					rows={contracts}
					rowsPerPageOptions={[5, 25, 50, 100]}
					columns={columns}
					filterModel={filterModel}
					sortModel={sortModel}
					onFilterModelChange={(newFilterModel) => setFilterModel(newFilterModel)}
					onSortModelChange={(newSortModel) => setSortModel(newSortModel)}
					components={{
						Toolbar: GridHeader
					}}
					density="compact"
					initialState={{
						columns: {
							columnVisibilityModel: {
								publickey: false,
								// createdAt: false,
								depositAvailableFrom: false,
								depositExpirationAt: false
							}
						}
					}}
				/>
			</Box>
		</>
	);
};

export default ExplorerContractDataGrid;
