import { Box, Switch, FormControlLabel, FormGroup } from '@mui/material';
import NumericField from 'components/atoms/NumericField';
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
				<NumericField
					label={'Strike'}
					value={redeemLogicOptions.strike}
					onChange={(newStrike: number) =>
						setRedeemLogicOptions({
							...redeemLogicOptions,
							strike: newStrike
						})
					}
				/>

				{['forward', 'settled_forward', 'vanilla_option'].includes(redeemLogicOptions.redeemLogicPluginType) && (
					<NumericField
						label={'Notional'}
						value={redeemLogicOptions.notional}
						onChange={(newNotional: number) =>
							setRedeemLogicOptions({
								...redeemLogicOptions,
								notional: newNotional
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
