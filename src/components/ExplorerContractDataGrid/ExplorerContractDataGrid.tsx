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
	GridLinkOperator,
	GridToolbarColumnsButton,
	GridToolbarFilterButton,
	GridToolbarExport,
	GridToolbarQuickFilter
} from '@mui/x-data-grid-pro';
import { useWallet } from '@solana/wallet-adapter-react';
import ContractStatusBadge from 'components/ContractStatusBadge';
import MomentTooltipSpan from 'components/MomentTooltipSpan';
import PublicKeyLink from 'components/PublicKeyLink';
import StatusBadge from 'components/StatusBadge';
import fetchContracts from 'controllers/fetchContracts';
import { AVAILABLE_CONTRACT_STATUS_IDS } from 'models/common';
import { AVAILABLE_PAYOFF_TYPE_IDS, PayoffTypeIds } from 'models/common';
import { DbOtcState } from 'models/DbOtcState';
import { Digital } from 'models/plugins/payoff/Digital';
import { Forward } from 'models/plugins/payoff/Forward';
import { SettledForward } from 'models/plugins/payoff/SettledForward';
import { VanillaOption } from 'models/plugins/payoff/VanillaOption';
import useExplorerParamsStore from 'store/useExplorerParamsStore';
import { getMintByPubkey } from 'utils/mintDatasetHelper';
import { formatWithDecimalDigits } from 'utils/numberHelpers';
import * as UrlBuilder from 'utils/urlBuilder';

import OracleLivePrice from '../OracleLivePrice';
import OtcContractContainer from '../OtcContractContainer';

// import dynamic from 'next/dynamic';
// const DynamicReactJson = dynamic(import('react-json-view'), { ssr: false });

const EMPTY_FILTER_MODEL: GridFilterModel = {
	items: []
};
const LIVE_CONTRACTS_FILTER_MODEL: GridFilterModel = {
	items: [
		{
			id: 0,
			columnField: 'contractStatus',
			operatorValue: 'is',
			value: 'live'
		}
	]
};

const CREATED_AT_SORT_MODEL: GridSortModel = [{ field: 'createdAt', sort: 'desc' }];

const ExplorerContractDataGrid = () => {
	const {
		filterModel: storageFilterModel,
		sortModel: storageSortModel,
		setFilterModel: setStorageFilterModel,
		setSortModel: setStorageSortModel
	} = useExplorerParamsStore();

	const wallet = useWallet();

	const [isLoading, setIsLoading] = useState(false);
	const [contracts, setContracts] = useState<DbOtcState[]>([]);
	const [filterModel, setFilterModel] = useState<GridFilterModel>(LIVE_CONTRACTS_FILTER_MODEL);
	const [sortModel, setSortModel] = useState<GridSortModel>(CREATED_AT_SORT_MODEL);

	useEffect(() => {
		if (storageFilterModel) setFilterModel(storageFilterModel);
		if (storageSortModel) setSortModel(storageSortModel);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		setStorageFilterModel(filterModel);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [filterModel]);

	useEffect(() => {
		setStorageSortModel(sortModel);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [sortModel]);

	useEffect(() => {
		// HARD CONTRACT SYNC, USE WITH CARE
		// const syncAllContracts = async (input: DbOtcState[]) => {
		// 	for (let i = 0; i < input.length; i++) {
		// 		const cc = input[i];
		// 		const chainOtcState = await fetchChainOtcStateFromDbInfo(connection, cc);
		// 		syncContractFromChain(chainOtcState);
		// 		await sleep(50);
		// 		console.log(`SYNC ALL CONTRACTS PROGRESS: ${i} / ${input.length} => ${formatWithDecimalDigits((100 * i) / input.length, 2)}%`);
		// 	}
		// };

		setIsLoading(true);
		fetchContracts()
			.then((c) => {
				setContracts(c);
				// syncAllContracts(c);
			})
			.finally(() => setIsLoading(false));
	}, []);

	const GridHeader = () => {
		return (
			<Stack direction="row" justifyContent="flex-start" alignItems="center" spacing={2}>
				{/* <GridToolbarContainer> */}
				<Button
					sx={{ px: 2, m: 1, height: 36 }}
					variant="outlined"
					disableRipple
					onClick={() => {
						setFilterModel(EMPTY_FILTER_MODEL);
						setSortModel(CREATED_AT_SORT_MODEL);
					}}
				>
					All Contracts
				</Button>
				<Button
					sx={{ px: 2, m: 1, height: 36 }}
					variant="outlined"
					disableRipple
					onClick={() => {
						setFilterModel(LIVE_CONTRACTS_FILTER_MODEL);
						setSortModel(CREATED_AT_SORT_MODEL);
					}}
				>
					Live Contracts
				</Button>
				<Button
					sx={{ px: 2, m: 1, height: 36 }}
					variant="outlined"
					disableRipple
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
						setSortModel(CREATED_AT_SORT_MODEL);
					}}
				>
					my contracts
				</Button>

				<GridToolbarColumnsButton
					sx={{ px: 2, m: 1, height: 36 }}
					variant="outlined"
					disableRipple
					nonce=""
					onResize={() => {
						//
					}}
					onResizeCapture={() => {
						//
					}}
				/>
				<GridToolbarExport sx={{ px: 2, m: 1, height: 36 }} variant="outlined" disableRipple />
				<GridToolbarFilterButton
					sx={{ px: 2, m: 1, height: 36 }}
					nonce=""
					onResize={() => {
						//
					}}
					onResizeCapture={() => {
						//
					}}
				/>

				<GridToolbarQuickFilter />
				{/* </GridToolbarContainer> */}

				{/* <GridToolbar showQuickFilter /> */}
			</Stack>
		);
	};

	const columns: GridColumns<DbOtcState> = [
		{
			field: 'publickey',
			headerName: 'Public Key',
			sortable: true,
			align: 'center',
			headerAlign: 'center',
			filterable: true,
			flex: 1,
			minWidth: 50,
			renderCell: (params) => {
				return <PublicKeyLink address={params.row.publickey.toBase58()} />;
			}
		},
		{
			field: 'redeemLogicAccount.state.payoffId',
			type: 'singleSelect',
			headerName: 'Instrument',
			flex: 1,
			minWidth: 120,
			valueOptions: AVAILABLE_PAYOFF_TYPE_IDS as any,
			sortable: true,
			align: 'center',
			headerAlign: 'center',
			filterable: true,
			renderCell: (params: GridRenderCellParams<[string, boolean | null]>) => {
				return (
					<Box sx={{ display: 'inline-flex' }}>
						<StatusBadge label={params.value[0]} mode="info" />
						{typeof params.value[1] === 'boolean' && <StatusBadge label={params.value[1] ? 'call' : 'put'} mode={params.value[1] ? 'success' : 'error'} />}
					</Box>
				);
			},
			valueGetter: (params) => {
				const dataObj = params.row.redeemLogicAccount.state.getPluginDataObj();
				return [params.row.metadata?.aliasId ?? params.row.redeemLogicAccount.state.payoffId, dataObj.hasOwnProperty('isCall') ? dataObj.isCall : null];
			}
		},
		{
			field: 'dynamicData.title',
			type: 'string',
			headerName: 'Underlying',
			flex: 1,
			minWidth: 120,
			sortable: true,
			align: 'center',
			headerAlign: 'center',
			filterable: true,
			valueGetter: (params) => {
				return params.row.dynamicData?.title ?? 'NA';
			}
		},
		{
			type: 'number',
			field: 'redeemLogicAccount.state.strike',
			headerName: 'Strike',
			flex: 1,
			minWidth: 100,
			sortable: true,
			align: 'center',
			headerAlign: 'center',
			filterable: true,
			valueGetter: (params) => {
				const rlState = params.row.redeemLogicAccount.state;
				switch (rlState.payoffId as PayoffTypeIds) {
					case 'forward':
						return formatWithDecimalDigits((rlState as Forward).strike);
					case 'settled_forward':
						return formatWithDecimalDigits((rlState as SettledForward).strike);
					case 'vanilla_option':
						return formatWithDecimalDigits((rlState as VanillaOption).strike);
					case 'digital':
						return formatWithDecimalDigits((rlState as Digital).strike);
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
			align: 'center',
			headerAlign: 'center',
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
			headerName: 'Created',
			renderCell: (params: GridRenderCellParams<number>) => <MomentTooltipSpan datetime={params.value} />,
			valueGetter: ({ value }) => value && new Date(value),
			sortable: true,
			align: 'center',
			headerAlign: 'center',
			filterable: true,
			flex: 1,
			minWidth: 100
		},
		{
			field: 'depositAvailableFrom',
			type: 'dateTime',
			headerName: 'Deposit start',
			renderCell: (params: GridRenderCellParams<number>) => <MomentTooltipSpan datetime={params.value} />,
			valueGetter: ({ value }) => value && new Date(value),
			sortable: true,
			align: 'center',
			headerAlign: 'center',
			filterable: true,
			flex: 1,
			minWidth: 100
		},
		{
			field: 'depositExpirationAt',
			type: 'dateTime',
			headerName: 'Deposit close',
			renderCell: (params: GridRenderCellParams<number>) => <MomentTooltipSpan datetime={params.value} />,
			valueGetter: ({ value }) => value && new Date(value),
			sortable: true,
			align: 'center',
			headerAlign: 'center',
			filterable: true,
			flex: 1,
			minWidth: 100
		},
		{
			field: 'settleAvailableFromAt',
			type: 'dateTime',
			headerName: 'Expiry',
			renderCell: (params: GridRenderCellParams<number>) => <MomentTooltipSpan datetime={params.value} />,
			valueGetter: ({ value }) => value && new Date(value),
			sortable: true,
			align: 'center',
			headerAlign: 'center',
			filterable: true,
			flex: 1,
			minWidth: 100
		},
		{
			field: 'longCollateral',
			type: 'number',
			headerName: 'Long Collateral',
			flex: 1,
			minWidth: 150,
			sortable: true,
			align: 'center',
			headerAlign: 'center',
			filterable: true,
			valueGetter: (params) => {
				const mint = getMintByPubkey(params.row.collateralMint);
				return `${formatWithDecimalDigits(params.row.buyerDepositAmount, -1)} ${mint?.title ?? ''}`;
			}
		},
		{
			field: 'shotCollateral',
			type: 'number',
			headerName: 'Short Collateral',
			flex: 1,
			minWidth: 150,
			sortable: true,
			align: 'center',
			headerAlign: 'center',
			filterable: true,
			valueGetter: (params) => {
				const mint = getMintByPubkey(params.row.collateralMint);
				return `${formatWithDecimalDigits(params.row.sellerDepositAmount, -1)} ${mint?.title ?? ''}`;
			}
		},
		{
			field: 'dynamicData.buyerWallet',
			headerName: 'Buyer wallet',
			sortable: true,
			align: 'center',
			headerAlign: 'center',
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
			align: 'center',
			headerAlign: 'center',
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
			align: 'center',
			headerAlign: 'center',
			filterable: true,
			renderCell: (params) => {
				return <ContractStatusBadge status={params.row.contractStatus} />;
			}
		},
		{
			type: 'boolean',
			field: 'dynamicData.sellerClaimed',
			headerName: 'Seller claimed',
			sortable: true,
			align: 'center',
			headerAlign: 'center',
			filterable: true,
			flex: 1,
			minWidth: 50,
			valueGetter: (params) => {
				return params.row.dynamicData?.sellerClaimed;
			}
		},
		{
			type: 'boolean',
			field: 'dynamicData.buyerClaimed',
			headerName: 'Buyer claimed',
			sortable: true,
			align: 'center',
			headerAlign: 'center',
			filterable: true,
			flex: 1,
			minWidth: 50,
			valueGetter: (params) => {
				return params.row.dynamicData?.buyerClaimed;
			}
		},
		{
			field: 'actionsShow',
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
					onFilterModelChange={(v) => setFilterModel(v)}
					onSortModelChange={(v) => setSortModel(v)}
					components={{
						Toolbar: GridHeader
					}}
					density="compact"
					initialState={{
						columns: {
							columnVisibilityModel: {
								publickey: false,
								depositAvailableFrom: false,
								depositExpirationAt: false,
								'dynamicData.buyerWallet': false,
								'dynamicData.sellerWallet': false,
								'dynamicData.buyerClaimed': false,
								'dynamicData.sellerClaimed': false,
								createdAt: false
							}
						},
						pagination: {
							pageSize: 25
						}
					}}
					isRowSelectable={(node: GridRowParams<DbOtcState>) => false}
					getDetailPanelContent={({ row }) => <OtcContractContainer pubkey={row.publickey.toBase58()} />}
					getDetailPanelHeight={() => 600}
				/>
			</Box>
		</>
	);
};

export default ExplorerContractDataGrid;
