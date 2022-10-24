import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { Box } from '@mui/material';
import { DataGrid, GridColumns, GridRowParams, GridRenderCellParams, GridActionsCellItem } from '@mui/x-data-grid';
import { getExplorerLink } from '@vyper-protocol/explorer-link-helper';
import ContractStatusBadge from 'components/molecules/ContractStatusBadge';
import MomentTooltipSpan from 'components/molecules/MomentTooltipSpan';
import PublicKeyLink from 'components/molecules/PublicKeyLink';
import { getCurrentCluster } from 'components/providers/OtcConnectionProvider';
import { Badge } from 'evergreen-ui';
import { ChainOtcState } from 'models/ChainOtcState';
import { AVAILABLE_REDEEM_LOGIC_PLUGINS } from 'models/plugins/AbsPlugin';
import { AbsRatePlugin } from 'models/plugins/rate/AbsRatePlugin';
import { RedeemLogicForwardPlugin } from 'models/plugins/redeemLogic/RedeemLogicForwardPlugin';
import { RedeemLogicSettledForwardPlugin } from 'models/plugins/redeemLogic/RedeemLogicSettledForwardPlugin';
import * as UrlBuilder from 'utils/urlBuilder';

import OracleLivePrice from '../OracleLivePrice';

// @ts-ignore
BigInt.prototype.toJSON = function () {
	return this.toString();
};

export type ExplorerContractDataGridProps = {
	contracts: ChainOtcState[];
};

const ExplorerContractDataGrid = ({ contracts }: ExplorerContractDataGridProps) => {
	const columns: GridColumns<ChainOtcState> = [
		{
			type: 'singleSelect',
			field: 'redeemLogicState.typeId',
			headerName: 'Instrument',
			sortable: false,
			filterable: true,
			valueOptions: AVAILABLE_REDEEM_LOGIC_PLUGINS,
			renderCell: (params: GridRenderCellParams<string>) => <Badge>{params.value}</Badge>,
			valueGetter: (params) => {
				return params.row.redeemLogicState.typeId;
			},
			width: 150
		},
		{
			type: 'string',
			field: 'rateState.title',
			headerName: 'Underlying',
			valueGetter: (params) => {
				return params.row.rateState.title;
			},
			width: 280
		},
		{
			type: 'number',
			field: 'redeemLogicState.notional',
			headerName: 'Size',
			valueGetter: (params) => {
				if (params.row.redeemLogicState.typeId === 'forward') {
					return (params.row.redeemLogicState as RedeemLogicForwardPlugin).notional;
				} else if (params.row.redeemLogicState.typeId === 'settled_forward') {
					return (params.row.redeemLogicState as RedeemLogicSettledForwardPlugin).notional;
				} else {
					return '-';
				}
			},
			width: 80
		},
		{
			type: 'number',
			field: 'redeemLogicState.strike',
			headerName: 'Strike',
			valueGetter: (params) => {
				if (params.row.redeemLogicState.typeId === 'forward') {
					return (params.row.redeemLogicState as RedeemLogicForwardPlugin).strike;
				} else if (params.row.redeemLogicState.typeId === 'settled_forward') {
					return (params.row.redeemLogicState as RedeemLogicSettledForwardPlugin).strike;
				} else {
					return '-';
				}
			},
			width: 150
		},
		{
			type: 'number',
			field: 'rateState.aggregatorLastValue',
			headerName: 'Current Price',
			renderCell: (params: GridRenderCellParams<any>) => (
				<OracleLivePrice oracleType={params.row.rateState.typeId} pubkey={(params.row.rateState as AbsRatePlugin).livePriceAccounts[0].toBase58()} />
			),
			width: 150
		},
		{
			field: 'settleAvailableFromAt',
			type: 'dateTime',
			headerName: 'Expiry',
			renderCell: (params: GridRenderCellParams<number>) => <MomentTooltipSpan datetime={params.value} />,
			sortable: true,
			filterable: true,
			width: 150
		},
		{
			type: 'boolean',
			field: 'buyerFunded',
			headerName: 'Long funded',
			sortable: true,
			filterable: true,
			width: 150,
			valueGetter: (params) => {
				return params.row.isBuyerFunded();
			}
		},
		{
			type: 'boolean',
			field: 'sellerFunded',
			headerName: 'Short funded',
			sortable: true,
			filterable: true,
			width: 150,
			valueGetter: (params) => {
				return params.row.isSellerFunded();
			}
		},
		{
			field: 'buyerWallet',
			headerName: 'Buyer wallet',
			sortable: true,
			filterable: true,
			width: 120,
			renderCell: (params) => {
				if (!params.row.buyerWallet) return <></>;
				return <PublicKeyLink address={params.row.buyerWallet?.toBase58()} />;
			}
		},
		{
			field: 'sellerWallet',
			headerName: 'Seller wallet',
			sortable: true,
			filterable: true,
			width: 120,
			renderCell: (params) => {
				if (!params.row.sellerWallet) return <></>;
				return <PublicKeyLink address={params.row.sellerWallet?.toBase58()} />;
			}
		},
		{
			field: 'contractStatus',
			headerName: 'Status',
			sortable: true,
			filterable: true,
			width: 100,
			renderCell: (params) => {
				return <ContractStatusBadge status={params.row.getContractStatus()} />;
			}
		},
		{
			field: 'actions',
			type: 'actions',
			headerName: 'Show details',
			width: 150,
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
		<Box sx={{ height: 800, maxWidth: 1600, width: '90%' }}>
			<DataGrid getRowId={(row) => row.publickey.toBase58()} rows={contracts} columns={columns} />
		</Box>
	);
};

export default ExplorerContractDataGrid;
