import { Box, Switch, FormControlLabel, FormGroup, TextField } from '@mui/material';
import { RLPluginTypeIds } from 'models/plugins/redeemLogic/RLStateType';

export type ParamsPickerInput = {
	// redeem logic plugin of the contract
	redeemLogicPluginType: RLPluginTypeIds;

	strike: number;

	// eslint-disable-next-line no-unused-vars
	setStrike: (val: number) => void;

	notional: number;

	// eslint-disable-next-line no-unused-vars
	setNotional: (val: number) => void;

	isCall: boolean;

	// eslint-disable-next-line no-unused-vars
	setIsCall: (val: boolean) => void;
};

export const ParamsPicker = ({ redeemLogicPluginType, strike, setStrike, notional, setNotional, isCall, setIsCall }: ParamsPickerInput) => {
	// setStrikeToDefaultValue
	return (
		<Box sx={{ marginY: 2 }}>
			<Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
				<TextField
					sx={{ alignItems: 'center', marginY: 2 }}
					label="Strike"
					variant="standard"
					type="number"
					InputLabelProps={{
						shrink: true
					}}
					value={strike}
					onChange={(e) => setStrike(+e.target.value)}
				/>
				{(redeemLogicPluginType === 'forward' || redeemLogicPluginType === 'settled_forward' || redeemLogicPluginType === 'vanilla_option') && (
					<TextField
						sx={{ alignItems: 'center', marginX: 2 }}
						label="Notional"
						variant="standard"
						type="number"
						InputLabelProps={{
							shrink: true
						}}
						value={notional}
						onChange={(e) => setNotional(+e.target.value)}
					/>
				)}
				{(redeemLogicPluginType === 'digital' || redeemLogicPluginType === 'vanilla_option') && (
					<FormGroup>
						<FormControlLabel control={<Switch checked={isCall} onChange={(e) => setIsCall(e.target.checked)} />} label={isCall ? 'Call' : 'Put'} />
					</FormGroup>
				)}
			</Box>
		</Box>
	);
};
