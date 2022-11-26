import { useState } from 'react';

import { Box, Stack, Autocomplete, TextField, Typography, Alert } from '@mui/material';
import { useConnection } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { getCurrentCluster } from 'components/providers/OtcConnectionProvider';
import { OracleDetail } from 'models/OracleDetail';
import { RatePluginTypeIds } from 'models/plugins/rate/RatePluginTypeIds';
import { RatePythState } from 'models/plugins/rate/RatePythState';
import { RateSwitchboardState } from 'models/plugins/rate/RateSwitchboardState';
import { getOracleByPubkey, getOracles, getOraclesByType } from 'utils/oracleDatasetHelper';
import { getRateExplorer } from 'utils/oraclesExplorerHelper';

type OraclePickerInput = {
	// label of the oracle
	rateLabel: string;

	// rates allowed
	options: OracleDetail[];

	// a rate plugin object
	ratePlugin: OracleDetail;

	// set callback, sets the rate plugin type
	// eslint-disable-next-line no-unused-vars
	setRatePlugin: (rate: OracleDetail) => void;
};

const OraclePicker = ({ rateLabel, options, ratePlugin, setRatePlugin }: OraclePickerInput) => {
	const { connection } = useConnection();
	const currentCluster = getCurrentCluster();
	const [value, setValue] = useState<string | OracleDetail>('');
	const [label, setLabel] = useState(<></>);

	async function getOracleInfo(oracle: string): Promise<['pyth' | 'switchboard', string]> {
		let publicKey;
		try {
			publicKey = new PublicKey(oracle);
		} catch {
			return [undefined, undefined];
		}

		let result: any = await RatePythState.GetProductPrice(connection, currentCluster, publicKey);
		if (result[0]) return ['pyth', result[0].symbol];

		result = await RateSwitchboardState.LoadAggregatorData(connection, publicKey);
		if (result) return ['switchboard', String.fromCharCode(...result.name)];

		return [undefined, undefined];
	}

	return (
		<>
			<Autocomplete
				sx={{ width: 300, marginY: 2 }}
				autoHighlight
				selectOnFocus
				clearOnBlur
				handleHomeEndKeys
				disableClearable
				freeSolo={currentCluster === 'devnet'}
				value={value}
				onInputChange={async (_, oracle: string, reason: string) => {
					if (reason !== 'input') return;

					const [ratePluginType, symbol] = await getOracleInfo(oracle);
					if (ratePluginType) {
						setRatePlugin({
							type: ratePluginType,
							cluster: currentCluster,
							pubkey: oracle,
							title: symbol,
							baseCurrency: '',
							quoteCurrency: '',
							explorerUrl: getRateExplorer(ratePluginType)
						});
						setLabel(
							<Box sx={{ paddingX: '16px', paddingY: '6px' }}>
								<Typography component="span">{symbol}</Typography>
								<Typography component="span" sx={{ color: 'grey', ml: 1, fontSize: '0.7em' }}>
									{ratePluginType.toUpperCase()}
								</Typography>
							</Box>
						);
					} else {
						setLabel(
							<Box sx={{ paddingY: '6px' }}>
								<Alert severity="error">The name / public key is not a recognized oracle.</Alert>
							</Box>
						);
					}
					setValue(oracle);
				}}
				getOptionLabel={(oracle: string | OracleDetail) => (typeof oracle === 'string' ? oracle : oracle.title)}
				renderOption={(props, option: OracleDetail) => (
					<Box component="li" {...props}>
						<Typography align="left">{option.title}</Typography>
						<Typography sx={{ color: 'grey', ml: 1, fontSize: '0.7em' }} align="right">
							{option.type.toUpperCase()}
						</Typography>
					</Box>
				)}
				options={options}
				renderInput={(params) => (
					<>
						<TextField {...params} label={rateLabel} />
						{label}
					</>
				)}
				onChange={async (_, oracle: OracleDetail | string) => {
					if (typeof oracle === 'object') {
						setRatePlugin(oracle);
						setLabel(<></>);
						setValue(oracle);
					}
				}}
			/>
			<a href={ratePlugin.explorerUrl} target="_blank" rel="noopener noreferrer">
				<Typography sx={{ textDecoration: 'underline', ml: 2 }}>View in explorer</Typography>
			</a>
		</>
	);
};

export type OraclesPickerInput = {
	oracleRequired: 'single' | 'double';
	ratePluginType: RatePluginTypeIds;
	setRatePluginType: (newVal: RatePluginTypeIds) => void;
	rateAccounts: PublicKey[];
	setRateAccounts: (newVal: PublicKey[]) => void;
};

// TODO Generalize to list of oracles, rendered based on redeemLogicPluginType
export const OraclesPicker = ({ oracleRequired: oraclesRequired, ratePluginType, setRatePluginType, rateAccounts, setRateAccounts }: OraclesPickerInput) => {
	// improve safety on accessing rateAccounts

	return (
		<Box sx={{ marginY: 2 }}>
			<Stack spacing={2}>
				<OraclePicker
					rateLabel={'Oracle #1'}
					options={getOracles()}
					ratePlugin={getOracleByPubkey(rateAccounts[0])}
					setRatePlugin={(newVal) => {
						setRatePluginType(newVal.type);
						setRateAccounts([new PublicKey(newVal.pubkey), rateAccounts[1]]);
					}}
				/>

				{oraclesRequired === 'double' && (
					<OraclePicker
						rateLabel={'Oracle #2'}
						options={getOraclesByType(ratePluginType)}
						ratePlugin={getOracleByPubkey(rateAccounts[1])}
						setRatePlugin={(newVal) => setRateAccounts([rateAccounts[0], new PublicKey(newVal.pubkey)])}
					/>
				)}
			</Stack>
		</Box>
	);
};
