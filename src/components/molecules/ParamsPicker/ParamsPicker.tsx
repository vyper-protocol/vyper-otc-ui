import { Box, Switch, FormControlLabel, FormGroup } from '@mui/material';
import NumericField from 'components/atoms/NumericField';
import { OtcInitializationParams } from 'controllers/createContract/OtcInitializationParams';
import { AliasTypeIds } from 'models/common';
import { isOptionAlias, needsNotional } from 'utils/aliasHelper';

type ParamsPickerProps = {
	// alias of the contract
	aliasId: AliasTypeIds;

	payoffOptions: OtcInitializationParams['payoffOption'];

	setPayoffOptions: (newVal: OtcInitializationParams['payoffOption']) => void;
};

const ParamsPicker = ({ aliasId, payoffOptions, setPayoffOptions }: ParamsPickerProps) => {
	// setStrikeToDefaultValue
	return (
		<Box sx={{ marginY: 2 }}>
			<Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
				<NumericField
					label={'Strike'}
					value={payoffOptions.strike}
					onChange={(newStrike: number) =>
						setPayoffOptions({
							...payoffOptions,
							strike: newStrike
						})
					}
				/>
				{needsNotional(aliasId) && (
					<NumericField
						label={'Notional'}
						value={payoffOptions.notional}
						onChange={(newNotional: number) =>
							setPayoffOptions({
								...payoffOptions,
								notional: newNotional
							})
						}
					/>
				)}
				{isOptionAlias(aliasId) && (
					<FormGroup>
						<FormControlLabel
							control={
								<Switch
									checked={payoffOptions.isCall}
									onChange={(e) =>
										setPayoffOptions({
											...payoffOptions,
											isCall: e.target.checked
										})
									}
								/>
							}
							label={payoffOptions.isCall ? 'Call' : 'Put'}
						/>
					</FormGroup>
				)}
			</Box>
		</Box>
	);
};

export default ParamsPicker;
