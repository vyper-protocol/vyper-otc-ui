import { useState } from 'react';

import { Box, Autocomplete, TextField, Typography } from '@mui/material';
import { PublicKey } from '@solana/web3.js';
import { getExplorerLink } from '@vyper-protocol/explorer-link-helper';
import { fetchTokenInfoCached } from 'api/next-api/fetchTokenInfo';
import MessageAlert from 'components/atoms/MessageAlert';
import TokenSymbol from 'components/atoms/TokenSymbol';
import { getCurrentCluster } from 'components/providers/OtcConnectionProvider';
import { MintDetail } from 'models/MintDetail';
import { TokenInfo } from 'models/TokenInfo';
import { getMintByPubkey, getMintByTitle, getMints } from 'utils/mintDatasetHelper';

// TODO: fix typing
export type ReservePickerInput = {
	longDepositAmount: number;

	setLongDepositAmount: (value: number) => void;

	shortDepositAmount: number;

	setShortDepositAmount: (value: number) => void;

	// collateral mint
	reserveMint: string;

	setReserveMint: (mint: string) => void;
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

// FIXME

export const ReservePicker = ({
	longDepositAmount,
	setLongDepositAmount,
	shortDepositAmount,
	setShortDepositAmount,
	reserveMint,
	setReserveMint,
	reserveError,
	setReserveError
}: ReservePickerProps) => {
	const [external, setExternal] = useState<ExternalType>({ isExternal: false });
	const [isLoading, setIsLoading] = useState(false);

	const handleInputChange = async (input: string) => {
		const mint = getMintByPubkey(input) || getMintByTitle(input);

		if (mint) {
			// pubkey is in mapped list
			setReserveMint(mint.pubkey);
			setReserveError(false);
			setExternal({ isExternal: false });
		} else {
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

			try {
				const mintTokenInfo = await fetchTokenInfoCached(pubkey);
				if (mintTokenInfo) {
					// mint found on-chain
					setReserveMint(mintTokenInfo.address);
					setReserveError(false);
					setExternal({ isExternal: true, token: mintTokenInfo });
				} else {
					// unknown mint, throw error
					setReserveError(true);
					setExternal({ isExternal: false });
				}
			} catch (err) {
				// fetch failed, throw error
				setReserveError(true);
				setExternal({ isExternal: false });
			} finally {
				setIsLoading(false);
			}
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
					value={reserveMint}
					onInputChange={async (_, input: string, reason: string) => {
						if (reason !== 'input') return;
						if (getCurrentCluster() === 'devnet') {
							await handleInputChange(input);
						}
					}}
					getOptionLabel={(mint: string) => getMintByPubkey(mint)?.title ?? mint}
					options={getMints().map((c) => c.pubkey)}
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
					href={getExplorerLink(reserveMint, { explorer: 'solscan', type: 'account', cluster: getCurrentCluster() })}
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
					value={longDepositAmount}
					onChange={(e) => setLongDepositAmount(+e.target.value)}
				/>

				<TextField
					sx={{ alignItems: 'center', marginX: 2 }}
					label="Short amount"
					variant="standard"
					type="number"
					InputLabelProps={{
						shrink: true
					}}
					value={shortDepositAmount}
					onChange={(e) => setShortDepositAmount(+e.target.value)}
				/>
			</Box>
		</Box>
	);
};
