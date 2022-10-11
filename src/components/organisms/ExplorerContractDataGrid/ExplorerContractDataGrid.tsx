import { useContext } from 'react';

import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { Box } from '@mui/material';
import { DataGrid, GridColumns, GridRowParams, GridValueFormatterParams, GridRenderCellParams, GridActionsCellItem } from '@mui/x-data-grid';
import { PublicKey } from '@solana/web3.js';
import { getExplorerLink } from '@vyper-protocol/explorer-link-helper';
import MomentTooltipSpan from 'components/molecules/MomentTooltipSpan';
import { UrlProviderContext } from 'components/providers/UrlClusterBuilderProvider';
import { Badge } from 'evergreen-ui';
import { ChainOtcState } from 'models/ChainOtcState';
import { AVAILABLE_RATE_PLUGINS, AVAILABLE_REDEEM_LOGIC_PLUGINS } from 'models/plugins/AbsPlugin';
import { useRouter } from 'next/router';
import { formatWithDecimalDigits } from 'utils/numberHelpers';
import { abbreviateAddress } from 'utils/stringHelpers';

// @ts-ignore
BigInt.prototype.toJSON = function () {
	return this.toString();
};

export type ExplorerContractDataGridProps = {
	contracts: ChainOtcState[];
};

const ExplorerContractDataGrid = ({ contracts }: ExplorerContractDataGridProps) => {
	const urlProvider = useContext(UrlProviderContext);
	const router = useRouter();

	const columns: GridColumns<ChainOtcState> = [
		{
			field: 'actions',
			type: 'actions',
			getActions: (params: GridRowParams) => [
				<GridActionsCellItem key="open" icon={<OpenInNewIcon />} onClick={() => router.push(urlProvider.buildContractSummaryUrl(params.id))} label="Open" />,
				<GridActionsCellItem
					key="open_in_explorer"
					icon={<OpenInNewIcon />}
					onClick={() => window.open(getExplorerLink(params.id.toString(), { explorer: 'solana-explorer', cluster: 'devnet' }))}
					label="Open in Explorer"
					showInMenu
				/>,
				<GridActionsCellItem
					key="open_in_solscan"
					icon={<OpenInNewIcon />}
					onClick={() => window.open(getExplorerLink(params.id.toString(), { explorer: 'solscan', cluster: 'devnet' }))}
					label="Open in Solscan"
					showInMenu
				/>
			]
		},
		{
			field: 'publickey',
			headerName: 'Public Key',
			valueFormatter: (params: GridValueFormatterParams<PublicKey>) => {
				return abbreviateAddress(params.value.toBase58());
			},
			width: 150,
			sortable: false
		},
		{
			field: 'depositExpirationAt',
			type: 'dateTime',
			headerName: 'Deposit Expiration',
			renderCell: (params: GridRenderCellParams<number>) => <MomentTooltipSpan datetime={params.value} />,
			sortable: true,
			filterable: true,
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
			headerName: 'Buyer funded',
			sortable: true,
			filterable: true,
			valueGetter: (params) => {
				return params.row.isBuyerFunded();
			}
		},
		{
			type: 'boolean',
			field: 'sellerFunded',
			headerName: 'Seller funded',
			sortable: true,
			filterable: true,
			valueGetter: (params) => {
				return params.row.isSellerFunded();
			}
		},
		{
			type: 'boolean',
			field: 'settleAvailable',
			headerName: 'Settle Available',
			sortable: true,
			filterable: true,
			valueGetter: (params) => {
				return params.row.isSettlementAvailable();
			}
		},
		{
			type: 'boolean',
			field: 'settleExecuted',
			headerName: 'Settle Executed',
			sortable: true,
			filterable: true
		},
		{
			type: 'singleSelect',
			field: 'rateState.getTypeId()',
			headerName: 'Rate Type',
			valueOptions: AVAILABLE_RATE_PLUGINS,
			renderCell: (params: GridRenderCellParams<string>) => <Badge color="green">{params.value}</Badge>,
			valueGetter: (params) => {
				return params.row.rateState.getTypeId();
			},
			width: 150
		},
		{
			type: 'string',
			field: 'rateState.getAggregatorName()',
			headerName: 'Underlying',
			valueGetter: (params) => {
				return params.row.rateState.getPluginDescription();
			},
			width: 150
		},
		{
			type: 'number',
			field: 'rateState.aggregatorLastValue',
			headerName: 'Current Price',
			valueGetter: (params) => {
				return formatWithDecimalDigits(params.row.rateState.getPluginLastValue());
			},
			width: 150
		},
		{
			type: 'singleSelect',
			field: 'redeemLogicState.getTypeId()',
			headerName: 'RedeemLogic Type',
			sortable: false,
			filterable: true,
			valueOptions: AVAILABLE_REDEEM_LOGIC_PLUGINS,
			renderCell: (params: GridRenderCellParams<string>) => <Badge>{params.value}</Badge>,
			valueGetter: (params) => {
				return params.row.redeemLogicState.getTypeId();
			},
			width: 150
		},
		{
			type: 'number',
			field: 'redeemLogicState.strike',
			headerName: 'Strike',
			valueGetter: (params) => {
				return formatWithDecimalDigits(params.row.redeemLogicState.strike);
			},
			width: 150
		},
		{
			type: 'number',
			field: 'redeemLogicState.notional',
			headerName: 'Leverage',
			valueGetter: (params) => {
				return params.row.redeemLogicState.notional;
			},
			width: 150
		}
	];

	return (
		<Box sx={{ height: 600, width: '90%' }}>
			<DataGrid getRowId={(row) => row.publickey.toBase58()} rows={contracts} columns={columns} />
		</Box>
	);
};

export default ExplorerContractDataGrid;
