import { useState } from 'react';

import SearchIcon from '@mui/icons-material/Search';
import { Box, Stack, Autocomplete, TextField, Typography, Alert, Fab } from '@mui/material';
import { useConnection } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { getCurrentCluster } from 'components/providers/OtcConnectionProvider';
import { OracleDetail } from 'models/OracleDetail';
import { RatePythState } from 'models/plugins/rate/RatePythState';
import { RateSwitchboardState } from 'models/plugins/rate/RateSwitchboardState';
import { RLPluginTypeIds } from 'models/plugins/redeemLogic/RLStateType';
import { getOracles, getOraclesByType } from 'utils/oracleDatasetHelper';
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

export type OraclesPickerInput = {
	// main rate plugin object
	ratePlugin1: OracleDetail;

	// set callback, sets the rate plugin type and the main rate puybey
	// eslint-disable-next-line no-unused-vars
	setRatePlugin1: (rate: OracleDetail) => void;

	// secondary rate plugin object
	ratePlugin2: OracleDetail;

	// set callback, sets the rate plugin type and the main rate puybey
	// eslint-disable-next-line no-unused-vars
	setRatePlugin2: (rate: OracleDetail) => void;

	// redeem logic plugin of the contract
	redeemLogicPluginType: RLPluginTypeIds;
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
			<Fab sx={{ marginX: 2, boxShadow: 2 }} color="default" size="small">
				<a href={ratePlugin.explorerUrl} target="_blank" rel="noopener noreferrer">
					<SearchIcon />
				</a>
			</Fab>
		</>
	);
};

// TODO Generalize to list of oracles, rendered based on redeemLogicPluginType
export const OraclesPicker = ({ ratePlugin1, setRatePlugin1, ratePlugin2, setRatePlugin2, redeemLogicPluginType }: OraclesPickerInput) => {
	return (
		<Box sx={{ marginY: 2 }}>
			<Stack spacing={2}>
				<OraclePicker rateLabel={'Oracle #1'} options={getOracles()} ratePlugin={ratePlugin1} setRatePlugin={setRatePlugin1} />

				{(redeemLogicPluginType as RLPluginTypeIds) === 'settled_forward' && (
					<OraclePicker rateLabel={'Oracle #2'} options={getOraclesByType(ratePlugin1.type)} ratePlugin={ratePlugin2} setRatePlugin={setRatePlugin2} />
				)}
			</Stack>
		</Box>
	);
};
