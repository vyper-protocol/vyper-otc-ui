import { Box, Autocomplete, TextField } from '@mui/material';
import { getExplorerLink } from '@vyper-protocol/explorer-link-helper';
import ExplorerIcon from 'components/atoms/ExplorerIcon';
import { getCurrentCluster } from 'components/providers/OtcConnectionProvider';
import { MintDetail } from 'models/MintDetail';
import { getMints } from 'utils/mintDatasetHelper';

export type ReservePickerInput = {
	seniorDepositAmount: number;

	// eslint-disable-next-line no-unused-vars
	setSeniorDepositAmount: (value: number) => void;

	juniorDepositAmount: number;

	// eslint-disable-next-line no-unused-vars
	setJuniorDepositAmount: (value: number) => void;

	// collateral mint
	reserveMint: MintDetail;

	// eslint-disable-next-line no-unused-vars
	setReserveMint: (mint: MintDetail) => void;
};

export const ReservePicker = ({
	seniorDepositAmount,
	setSeniorDepositAmount,
	juniorDepositAmount,
	setJuniorDepositAmount,
	reserveMint,
	setReserveMint
}: ReservePickerInput) => {
	return (
		<Box sx={{ marginY: 2 }}>
			<Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
				<Autocomplete
					sx={{ width: 300, alignItems: 'center', marginY: 2 }}
					autoHighlight
					selectOnFocus
					clearOnBlur
					handleHomeEndKeys
					disableClearable
					getOptionLabel={(mint: MintDetail) => mint.title}
					options={getMints()}
					renderInput={(params) => <TextField {...params} label="Collateral mint" />}
					onChange={(_, mint: MintDetail) => setReserveMint(mint)}
					value={reserveMint}
				/>
				<ExplorerIcon link={getExplorerLink(reserveMint.pubkey, { explorer: 'solscan', type: 'account', cluster: getCurrentCluster() })} />
			</Box>
			<Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
				<TextField
					label="Long amount"
					variant="standard"
					type="number"
					InputLabelProps={{
						shrink: true
					}}
					value={seniorDepositAmount}
					onChange={(e) => setSeniorDepositAmount(+e.target.value)}
				/>

				<TextField
					sx={{ alignItems: 'center', marginX: 2 }}
					label="Short amount"
					variant="standard"
					type="number"
					InputLabelProps={{
						shrink: true
					}}
					value={juniorDepositAmount}
					onChange={(e) => setJuniorDepositAmount(+e.target.value)}
				/>
			</Box>
		</Box>
	);
};
