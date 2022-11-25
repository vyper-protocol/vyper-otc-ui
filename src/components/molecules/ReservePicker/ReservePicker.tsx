import { useState } from 'react';

import { Box, Autocomplete, TextField, Typography } from '@mui/material';
import { PublicKey } from '@solana/web3.js';
import { getExplorerLink } from '@vyper-protocol/explorer-link-helper';
import { fetchTokenInfo } from 'api/next-api/fetchTokenInfo';
import MessageAlert from 'components/atoms/MessageAlert';
import TokenSymbol from 'components/atoms/TokenSymbol';
import { getCurrentCluster } from 'components/providers/OtcConnectionProvider';
import { MintDetail } from 'models/MintDetail';
import { TokenInfo } from 'models/TokenInfo';
import { getMintByPubkey, getMintByTitle, getMintFromTokenInfo, getMints } from 'utils/mintDatasetHelper';

// TODO: fix typing
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

type ReservePickerProps = ReservePickerInput & {
	// error in mint input
	reserveError: boolean;

	// eslint-disable-next-line no-unused-vars
	setReserveError: (error: boolean) => void;
};

type ExternalType = {
	// the input is a valid external mint
	isExternal: boolean;

	// token metadata
	token?: TokenInfo;
};

export const ReservePicker = ({
	seniorDepositAmount,
	setSeniorDepositAmount,
	juniorDepositAmount,
	setJuniorDepositAmount,
	reserveMint,
	setReserveMint,
	reserveError,
	setReserveError
}: ReservePickerProps) => {
	const [value, setValue] = useState(reserveMint.title);
	const [external, setExternal] = useState<ExternalType>({ isExternal: false });
	const [isLoading, setIsLoading] = useState(false);

	const handleInputChange = async (input: string) => {
		const mint = getMintByPubkey(input) || getMintByTitle(input);

		if (mint) {
			// pubkey is in mapped list
			setReserveMint(mint);
			setValue(mint.title);
			setReserveError(false);
			setExternal({ isExternal: false });
		} else {
			setValue(input);
			// pubkey isn't mapped, look for it on chain
			let pubkey: PublicKey;
			try {
				pubkey = new PublicKey(input);
			} catch {
				// string is not a pubkey
				setReserveError(true);
				setExternal({ isExternal: false });
				return;
			}

			setIsLoading(true);

			await fetchTokenInfo(pubkey).then(
				(mintTokenInfo) => {
					setIsLoading(false);
					if (mintTokenInfo) {
						// mint found on-chain
						setReserveMint(getMintFromTokenInfo(mintTokenInfo));
						setReserveError(false);
						setExternal({ isExternal: true, token: mintTokenInfo });
					} else {
						// unknown mint, throw error
						setReserveError(true);
						setExternal({ isExternal: false });
					}
				},
				() => {
					// fetch failed, throw error
					setReserveError(true);
					setExternal({ isExternal: false });
				}
			);
		}
	};

	return (
		<Box sx={{ marginY: 2 }}>
			<Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
				<Autocomplete
					disabled={isLoading}
					sx={{ width: 300, alignItems: 'center', marginY: 2 }}
					disableClearable
					autoHighlight
					selectOnFocus
					clearOnBlur
					handleHomeEndKeys
					freeSolo={getCurrentCluster() === 'devnet'}
					value={value}
					onInputChange={async (_, input: string, reason: string) => {
						if (reason !== 'input') return;
						if (getCurrentCluster() === 'devnet') {
							await handleInputChange(input);
						}
					}}
					getOptionLabel={(mint: MintDetail | string) => (typeof mint === 'string' ? mint : mint.title)}
					options={getMints()}
					renderInput={(params) => <TextField {...params} label={isLoading ? 'Loading' : 'Collateral mint'} />}
					onChange={async (_, mintOrPubkey: MintDetail | string) => {
						if (typeof mintOrPubkey === 'object') {
							handleInputChange(mintOrPubkey.title);
						} else {
							await handleInputChange(mintOrPubkey);
						}
					}}
				/>
				<a
					href={getExplorerLink(reserveMint.pubkey, { explorer: 'solscan', type: 'account', cluster: getCurrentCluster() })}
					target="_blank"
					rel="noopener noreferrer"
				>
					<Typography sx={{ textDecoration: 'underline', ml: 2 }}>View in explorer</Typography>
				</a>
			</Box>
			{reserveError && (
				<div>
					<MessageAlert message={'Mint provided is invalid'} severity={'error'} />
				</div>
			)}
			{external.isExternal && (
				<div>
					<MessageAlert message={'Found external mint: '} severity={'info'}>
						<TokenSymbol token={external.token as TokenInfo}></TokenSymbol>
					</MessageAlert>
					<MessageAlert message={'Please use extra care when using external mints.'} severity={'info'} />
				</div>
			)}
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
