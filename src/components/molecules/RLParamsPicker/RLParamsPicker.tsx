import { Box, Switch, FormControlLabel, FormGroup, TextField } from '@mui/material';
import { OtcInitializationParams } from 'controllers/createContract/OtcInitializationParams';

export type RLParamsPickerInput = {
	redeemLogicOptions: OtcInitializationParams['redeemLogicOption'];
	setRedeemLogicOptions: (newVal: OtcInitializationParams['redeemLogicOption']) => void;
};

export const RLParamsPicker = ({ redeemLogicOptions, setRedeemLogicOptions }: RLParamsPickerInput) => {
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
					value={redeemLogicOptions.strike}
					onChange={(e) =>
						setRedeemLogicOptions({
							...redeemLogicOptions,
							strike: +e.target.value
						})
					}
				/>
				{['forward', 'settled_forward', 'vanilla_option'].includes(redeemLogicOptions.redeemLogicPluginType) && (
					<TextField
						sx={{ alignItems: 'center', marginX: 2 }}
						label="Notional"
						variant="standard"
						type="number"
						InputLabelProps={{
							shrink: true
						}}
						value={redeemLogicOptions.notional}
						onChange={(e) =>
							setRedeemLogicOptions({
								...redeemLogicOptions,
								notional: +e.target.value
							})
						}
					/>
				)}
				{['digital', 'vanilla_option'].includes(redeemLogicOptions.redeemLogicPluginType) && (
					<FormGroup>
						<FormControlLabel
							control={
								<Switch
									checked={redeemLogicOptions.isCall}
									onChange={(e) =>
										setRedeemLogicOptions({
											...redeemLogicOptions,
											isCall: e.target.checked
										})
									}
								/>
							}
							label={redeemLogicOptions.isCall ? 'Call' : 'Put'}
						/>
					</FormGroup>
				)}
			</Box>
		</Box>
	);
};
