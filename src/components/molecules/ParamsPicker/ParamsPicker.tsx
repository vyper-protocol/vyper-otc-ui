import { Box, Switch, FormControlLabel, FormGroup, TextField } from '@mui/material';
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
				<TextField
					sx={{ alignItems: 'center', marginY: 2 }}
					label="Strike"
					variant="standard"
					type="number"
					InputLabelProps={{
						shrink: true
					}}
					value={payoffOptions.strike}
					onChange={(e) =>
						setPayoffOptions({
							...payoffOptions,
							strike: +e.target.value
						})
					}
				/>
				{needsNotional(aliasId) && (
					<TextField
						sx={{ alignItems: 'center', marginX: 2 }}
						label="Notional"
						variant="standard"
						type="number"
						InputLabelProps={{
							shrink: true
						}}
						value={payoffOptions.notional}
						onChange={(e) =>
							setPayoffOptions({
								...payoffOptions,
								notional: +e.target.value
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
