import SearchIcon from '@mui/icons-material/Search';
import { Box, Autocomplete, TextField, Grid, Typography, Fab } from '@mui/material';
import { OracleDetail } from 'models/OracleDetail';
import { RedeemLogicPluginTypeIds } from 'models/plugins/AbsPlugin';
import { getOracles, getOraclesByType } from 'utils/oracleDatasetHelper';

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

// TODO allow arbitrary oracle ids

export const OraclesPicker = ({ ratePlugin1, setRatePlugin1, ratePlugin2, setRatePlugin2, redeemLogicPluginType }: OraclesPickerInput) => {
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
						onChange={(_, oracle: OracleDetail) => {
							setRatePlugin1(oracle);
						}}
					/>
					<Fab sx={{ marginX: 2, boxShadow: 2 }} color="default" size="small">
						<a href={ratePlugin1.explorerUrl} target="_blank" rel="noopener noreferrer">
							<SearchIcon />
						</a>
					</Fab>
				</Grid>
				<Grid item xs={6}>
					{(redeemLogicPluginType as RedeemLogicPluginTypeIds) === 'settled_forward' && (
						<Box>
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
								options={getOraclesByType(ratePlugin1.type)}
								renderInput={(params) => <TextField {...params} label="Oracle #2" />}
								onChange={(_, oracle: OracleDetail) => {
									setRatePlugin2(oracle);
								}}
							/>
							<Fab sx={{ marginX: 2, boxShadow: 2 }} color="default" size="small">
								<a href={ratePlugin2.explorerUrl} target="_blank" rel="noopener noreferrer">
									<SearchIcon />
								</a>
							</Fab>
						</Box>
					)}
				</Grid>
			</Grid>
		</Box>
	);
};
