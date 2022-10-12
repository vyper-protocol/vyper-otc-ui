import { useContext } from 'react';

import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { Box } from '@mui/material';
import { DataGrid, GridColumns, GridRowParams, GridValueFormatterParams, GridRenderCellParams, GridActionsCellItem } from '@mui/x-data-grid';
import { useConnection } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { getExplorerLink } from '@vyper-protocol/explorer-link-helper';
import MomentTooltipSpan from 'components/molecules/MomentTooltipSpan';
import { UrlProviderContext } from 'components/providers/UrlClusterBuilderProvider';
import { Badge } from 'evergreen-ui';
import { ChainOtcState } from 'models/ChainOtcState';
import { AVAILABLE_RATE_PLUGINS, AVAILABLE_REDEEM_LOGIC_PLUGINS } from 'models/plugins/AbsPlugin';
import { useRouter } from 'next/router';
import { getClusterFromRpcEndpoint } from 'utils/clusterHelpers';
import { formatWithDecimalDigits } from 'utils/numberHelpers';
import { abbreviateAddress } from 'utils/stringHelpers';
import { MdCheckCircleOutline } from 'react-icons/md';

// @ts-ignore
BigInt.prototype.toJSON = function () {
	return this.toString();
};

export type ExplorerContractDataGridProps = {
	contracts: ChainOtcState[];
};

const ExplorerContractDataGrid = ({ contracts }: ExplorerContractDataGridProps) => {
	const urlProvider = useContext(UrlProviderContext);
	const { connection } = useConnection();
	const router = useRouter();

	const columns: GridColumns<ChainOtcState> = [
		{
			type: 'singleSelect',
			field: 'redeemLogicState.getTypeId()',
			headerName: 'Instrument',
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
			type: 'string',
			field: 'rateState.getAggregatorName()',
			headerName: 'Underlying',
			valueGetter: (params) => {
				return params.row.rateState.getPluginDescription();
			},
			width: 280
		},
		{
			type: 'number',
			field: 'redeemLogicState.notional',
			headerName: 'Size',
			valueGetter: (params) => {
				return params.row.redeemLogicState.notional;
			},
			width: 80
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
			field: 'rateState.aggregatorLastValue',
			headerName: 'Current Price',
			valueGetter: (params) => {
				return formatWithDecimalDigits(params.row.rateState.getPluginLastValue());
			},
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
			field: 'actions',
			type: 'actions',
			headerName: 'Show details',
			width: 150,
			getActions: (params: GridRowParams) => [
				<GridActionsCellItem key="open" icon={<OpenInNewIcon />} onClick={() => router.push(urlProvider.buildContractSummaryUrl(params.id))} label="Open" />,
				<GridActionsCellItem
					key="open_in_explorer"
					icon={<OpenInNewIcon />}
					onClick={() =>
						window.open(getExplorerLink(params.id.toString(), { explorer: 'solana-explorer', cluster: getClusterFromRpcEndpoint(connection.rpcEndpoint) }))
					}
					label="Open in Explorer"
					showInMenu
				/>,
				<GridActionsCellItem
					key="open_in_solscan"
					icon={<OpenInNewIcon />}
					onClick={() =>
						window.open(getExplorerLink(params.id.toString(), { explorer: 'solscan', cluster: getClusterFromRpcEndpoint(connection.rpcEndpoint) }))
					}
					label="Open in Solscan"
					showInMenu
				/>
			]
		}
	];

	return (
		<Box sx={{ height: 600, maxWidth: 1600, width: '90%' }}>
			<DataGrid getRowId={(row) => row.publickey.toBase58()} rows={contracts} columns={columns} />
		</Box>
	);
};

export default ExplorerContractDataGrid;
