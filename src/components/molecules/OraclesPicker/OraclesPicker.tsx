import { useState } from 'react';
import { Box, Autocomplete, TextField, Grid, Typography, Alert } from '@mui/material';
import { useConnection } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { getCurrentCluster } from 'components/providers/OtcConnectionProvider';
import { OracleDetail } from 'models/OracleDetail';
import { RatePluginTypeIds, RedeemLogicPluginTypeIds } from 'models/plugins/AbsPlugin';
import { getOracles, getOraclesByType } from 'utils/oracleDatasetHelper';
import { RatePythPlugin } from 'models/plugins/rate/RatePythPlugin';
import RateSwitchboardPlugin from 'models/plugins/rate/RateSwitchboardPlugin';

type OraclesPickerInput = {
	// set callback, sets the rate plugin type and the main rate puybey
	// eslint-disable-next-line no-unused-vars
	setRateMain: (rateType: RatePluginTypeIds, pubkey: string) => void;

	// set callback, sets the secondary rate puybey
	// eslint-disable-next-line no-unused-vars
	setRate2: (pubkey: string) => void;

	// rate plugin of the contract
	ratePluginType: RatePluginTypeIds;

	// redeem logic plugin of the contract
	redeemLogicPluginType: RedeemLogicPluginTypeIds;
};

const OraclePicker = ({ setRate, oracles }) => {
	const { connection } = useConnection();
	const currentCluster = getCurrentCluster();
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
		<Autocomplete
			sx={{ width: 300, marginY: 2 }}
			autoHighlight
			selectOnFocus
			clearOnBlur
			handleHomeEndKeys
			disableClearable
			freeSolo={currentCluster === 'devnet'}
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
				if (typeof oracle === 'string') {
					const [ratePluginType, symbol] = await getOracleInfo(oracle);
					if (ratePluginType) {
						setRate(ratePluginType, oracle);
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
								<Alert severity="error">The public key is not a recognized oracle.</Alert>
							</Box>
						);
					}
				} else {
					setRate(oracle.type, oracle.pubkey);
					setLabel(<></>);
				}
			}}
		/>
	);
};

const OraclesPicker = ({ setRateMain, setRate2, ratePluginType, redeemLogicPluginType }: OraclesPickerInput) => {
	return (
		<Box sx={{ marginY: 2 }}>
			{/* <b>{redeemLogic === 'settled_forward' ? 'SELECT UNDERLYINGS' : 'SELECT UNDERLYING'}</b> */}
			<Grid container spacing={2}>
				<Grid item xs={6}>
					<OraclePicker setRate={setRateMain} oracles={getOracles()} />
				</Grid>
				<Grid item xs={6}>
					{(redeemLogicPluginType as RedeemLogicPluginTypeIds) === 'settled_forward' && (
						<OraclePicker setRate={setRate2} oracles={getOraclesByType(ratePluginType)} />
					)}
				</Grid>
			</Grid>
		</Box>
	);
};

export default OraclesPicker;
