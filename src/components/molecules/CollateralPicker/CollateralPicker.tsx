import { useState } from 'react';

import { Box, Autocomplete, TextField, Typography } from '@mui/material';
import { PublicKey } from '@solana/web3.js';
import { getExplorerLink } from '@vyper-protocol/explorer-link-helper';
import { fetchTokenInfoCached } from 'api/next-api/fetchTokenInfo';
import MessageAlert from 'components/atoms/MessageAlert';
import NumericField from 'components/atoms/NumericField';
import TokenSymbol from 'components/atoms/TokenSymbol';
import { getCurrentCluster } from 'components/providers/OtcConnectionProvider';
import { AliasTypeIds } from 'models/common';
import { MintDetail } from 'models/MintDetail';
import { TokenInfo } from 'models/TokenInfo';
import { getSidesLabel } from 'utils/aliasHelper';
import { getMintByPubkey, getMintByTitle, getMints } from 'utils/mintDatasetHelper';

type CollateralPickerProps = {
	// alias of the contract
	aliasId: AliasTypeIds;

	longDepositAmount: number;

	setLongDepositAmount: (value: number) => void;

	shortDepositAmount: number;

	setShortDepositAmount: (value: number) => void;

	// collateral mint
	collateralMint: string;

	setCollateralMint: (mint: string) => void;

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

const CollateralPicker = ({
	aliasId,
	longDepositAmount,
	setLongDepositAmount,
	shortDepositAmount,
	setShortDepositAmount,
	collateralMint,
	setCollateralMint,
	reserveError,
	setReserveError
}: CollateralPickerProps) => {
	const [external, setExternal] = useState<ExternalType>({ isExternal: false });
	const [isLoading, setIsLoading] = useState(false);

	const [longLabel, shortLabel] = getSidesLabel(aliasId);

	const handleInputChange = async (input: string) => {
		const mint = getMintByPubkey(input) || getMintByTitle(input);

		if (mint) {
			// pubkey is in mapped list
			setCollateralMint(mint.pubkey);
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
					setCollateralMint(mintTokenInfo.address);
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
			<Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', mb: 2 }}>
				<NumericField label={longLabel} value={longDepositAmount} onChange={(newAmount: number) => setLongDepositAmount(newAmount)} />
				<NumericField label={shortLabel} value={shortDepositAmount} onChange={(newAmount: number) => setShortDepositAmount(newAmount)} />
			</Box>
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
					value={collateralMint}
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
					href={getExplorerLink(collateralMint, { explorer: 'solscan', type: 'account', cluster: getCurrentCluster() })}
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
		</Box>
	);
};

export default CollateralPicker;
