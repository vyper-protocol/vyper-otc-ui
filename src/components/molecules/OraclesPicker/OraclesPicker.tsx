import { Box, Autocomplete, TextField, Grid, Typography } from '@mui/material';
import { OracleDetail } from 'models/OracleDetail';
import { RatePluginTypeIds, RedeemLogicPluginTypeIds } from 'models/plugins/AbsPlugin';
import { getOracles, getOraclesByType } from 'utils/oracleDatasetHelper';

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

// TODO allow arbitrary oracle ids

const OraclesPicker = ({ setRateMain, setRate2, ratePluginType, redeemLogicPluginType }: OraclesPickerInput) => {
	return (
		<Box sx={{ marginY: 2 }}>
			{/* <b>{redeemLogic === 'settled_forward' ? 'SELECT UNDERLYINGS' : 'SELECT UNDERLYING'}</b> */}
			<Grid container spacing={2}>
				<Grid item xs={6}>
					<Autocomplete
						sx={{ width: 300, marginY: 2 }}
						autoHighlight
						selectOnFocus
						clearOnBlur
						handleHomeEndKeys
						disableClearable
						getOptionLabel={(oracle: OracleDetail) => oracle.title}
						renderOption={(props, option: OracleDetail) => (
							<Box component="li" {...props}>
								<Typography align="left">{option.title}</Typography>
								<Typography sx={{ color: 'grey', ml: 1, fontSize: '0.7em' }} align="right">
									{option.type.toUpperCase()}
								</Typography>
							</Box>
						)}
						options={getOracles()}
						renderInput={(params) => <TextField {...params} label="Oracle #1" />}
						onChange={(_, oracle: OracleDetail) => setRateMain(oracle.type, oracle.pubkey)}
					/>
				</Grid>
				<Grid item xs={6}>
					{(redeemLogicPluginType as RedeemLogicPluginTypeIds) === 'settled_forward' && (
						<Autocomplete
							sx={{ width: 300, alignItems: 'center', marginY: 2 }}
							disableClearable
							getOptionLabel={(oracle: OracleDetail) => oracle.title}
							renderOption={(props, option: OracleDetail) => (
								<Box component="li" {...props}>
									<Typography align="left">{option.title}</Typography>
									<Typography sx={{ color: 'grey', ml: 1, fontSize: '0.7em' }} align="right">
										{option.type.toUpperCase()}
									</Typography>
								</Box>
							)}
							options={getOraclesByType(ratePluginType)}
							renderInput={(params) => <TextField {...params} label="Oracle #2" />}
							onChange={(_, oracle: OracleDetail) => setRate2(oracle.pubkey)}
						/>
					)}
				</Grid>
			</Grid>
		</Box>
	);
};

export default OraclesPicker;
