import { Box, Autocomplete, TextField, Grid, Typography } from '@mui/material';
import { OracleDetail } from 'models/OracleDetail';
import { RedeemLogicPluginTypeIds } from 'models/plugins/AbsPlugin';
import { getOracles, getOraclesByType } from 'utils/oracleDatasetHelper';

// TODO allow arbitrary oracle ids

const OraclesPicker = ({ onChange, onChangeSecondary, rate, redeemLogic }) => {
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
						onChange={(_, oracle: OracleDetail) => onChange(oracle.type, oracle.pubkey)}
					/>
				</Grid>
				<Grid item xs={6}>
					{(redeemLogic as RedeemLogicPluginTypeIds) === 'settled_forward' && (
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
							options={getOraclesByType(rate)}
							renderInput={(params) => <TextField {...params} label="Oracle #2" />}
							onChange={(_, oracle: OracleDetail) => onChangeSecondary(oracle.pubkey)}
						/>
					)}
				</Grid>
			</Grid>
		</Box>
	);
};

export default OraclesPicker;
