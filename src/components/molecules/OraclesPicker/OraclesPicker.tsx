import { Box, Autocomplete, TextField, Typography, Stack } from '@mui/material';
import ExplorerIcon from 'components/atoms/ExplorerIcon';
import { OracleDetail } from 'models/OracleDetail';
import { RedeemLogicPluginTypeIds } from 'models/plugins/AbsPlugin';
import { getOracles, getOraclesByType } from 'utils/oracleDatasetHelper';

type OraclePickerInput = {
	// label of the oracle
	label: string;

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
	redeemLogicPluginType: RedeemLogicPluginTypeIds;
};

// TODO allow arbitrary oracle ids
const OraclePicker = ({ label, options, ratePlugin, setRatePlugin }: OraclePickerInput) => {
	return (
		<Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
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
				options={options}
				renderInput={(params) => <TextField {...params} label={label} />}
				onChange={(_, oracle: OracleDetail) => {
					setRatePlugin(oracle);
				}}
				value={ratePlugin}
			/>
			<ExplorerIcon link={ratePlugin.explorerUrl} />
		</Box>
	);
};

// TODO Generalize to list of oracles, rendered based on redeemLogicPluginType
export const OraclesPicker = ({ ratePlugin1, setRatePlugin1, ratePlugin2, setRatePlugin2, redeemLogicPluginType }: OraclesPickerInput) => {
	return (
		<Box sx={{ marginY: 2 }}>
			<Stack spacing={2}>
				<OraclePicker label={'Oracle #1'} options={getOracles()} ratePlugin={ratePlugin1} setRatePlugin={setRatePlugin1} />

				{(redeemLogicPluginType as RedeemLogicPluginTypeIds) === 'settled_forward' && (
					<OraclePicker label={'Oracle #2'} options={getOraclesByType(ratePlugin1.type)} ratePlugin={ratePlugin2} setRatePlugin={setRatePlugin2} />
				)}
			</Stack>
		</Box>
	);
};
