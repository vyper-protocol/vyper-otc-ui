import { useState } from 'react';

import SearchIcon from '@mui/icons-material/Search';
import { Box, Autocomplete, TextField, Fab } from '@mui/material';
import { getExplorerLink } from '@vyper-protocol/explorer-link-helper';
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

	// reserve mint of collateral tokens
	// eslint-disable-next-line no-unused-vars
	setReserveMint: (pubkey: string) => void;
};

export const ReservePicker = ({
	seniorDepositAmount,
	setSeniorDepositAmount,
	juniorDepositAmount,
	setJuniorDepositAmount,
	setReserveMint
}: ReservePickerInput) => {
	const [selectedMint, setSelectedMint] = useState('');

	const handleMint = (pubkey: string) => {
		setSelectedMint(pubkey);
		setReserveMint(pubkey);
	};

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
					onChange={(_, mint: MintDetail) => handleMint(mint.pubkey)}
				/>
				<Fab sx={{ marginX: 2, boxShadow: 2 }} color="default" size="small">
					<a
						href={getExplorerLink(selectedMint, { explorer: 'solscan', type: 'account', cluster: getCurrentCluster() })}
						target="_blank"
						rel="noopener noreferrer"
					>
						<SearchIcon />
					</a>
				</Fab>
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
