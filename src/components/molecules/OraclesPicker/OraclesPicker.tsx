import { useState } from 'react';
import { Box, Autocomplete, TextField, Grid, Typography, Alert, Fab } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useConnection } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { getExplorerLink } from '@vyper-protocol/explorer-link-helper';
import { getCurrentCluster } from 'components/providers/OtcConnectionProvider';
import { OracleDetail } from 'models/OracleDetail';
import { RedeemLogicPluginTypeIds } from 'models/plugins/AbsPlugin';
import { getOracles, getOraclesByType } from 'utils/oracleDatasetHelper';
import { RatePythPlugin } from 'models/plugins/rate/RatePythPlugin';
import RateSwitchboardPlugin from 'models/plugins/rate/RateSwitchboardPlugin';

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
	redeemLogicPluginType: RedeemLogicPluginTypeIds;
};

const OraclePicker = ({ ratePlugin, setRatePlugin, oracles }) => {
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

		let result: any = await RatePythPlugin.GetProductPrice(connection, currentCluster, publicKey);
		if (result[0]) return ['pyth', result[0].symbol];

		result = await RateSwitchboardPlugin.LoadAggregatorData(connection, publicKey);
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
							explorerUrl: getExplorerLink(oracle, { explorer: 'solscan', type: 'account', cluster: currentCluster })
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
				getOptionLabel={(oracle: string | OracleDetail) => typeof oracle === 'string' ? oracle : oracle.title}
				renderOption={(props, option: OracleDetail) => (
					<Box component="li" {...props}>
						<Typography align="left">{option.title}</Typography>
						<Typography sx={{ color: 'grey', ml: 1, fontSize: '0.7em' }} align="right">
							{option.type.toUpperCase()}
						</Typography>
					</Box>
				)}
				options={oracles}
				renderInput={(params) => <>
					<TextField {...params} label="Oracle #1" />
					{label}
				</>}
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

export const OraclesPicker = ({ ratePlugin1, setRatePlugin1, ratePlugin2, setRatePlugin2, redeemLogicPluginType }: OraclesPickerInput) => {
	return (
		<Box sx={{ marginY: 2 }}>
			{/* <b>{redeemLogic === 'settled_forward' ? 'SELECT UNDERLYINGS' : 'SELECT UNDERLYING'}</b> */}
			<Grid container spacing={2}>
				<Grid item xs={6}>
					<OraclePicker ratePlugin={ratePlugin1} setRatePlugin={setRatePlugin1} oracles={getOracles()} />
				</Grid>
				<Grid item xs={6}>
					{(redeemLogicPluginType as RedeemLogicPluginTypeIds) === 'settled_forward' && (
						<OraclePicker ratePlugin={ratePlugin2} setRatePlugin={setRatePlugin2} oracles={getOraclesByType(ratePlugin1.type)} />
					)}
				</Grid>
			</Grid>
		</Box>
	);
};
