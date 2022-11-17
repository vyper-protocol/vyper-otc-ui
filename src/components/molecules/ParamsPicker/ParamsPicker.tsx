import { Box, Switch, FormControlLabel, FormGroup, TextField } from '@mui/material';
import { Button, RefreshIcon, IconButton, Pane, TextInputField } from 'evergreen-ui';

const StrikePicker = ({
	title,
	value,
	onChange,
	onRefreshClick
}: {
	title: string;
	value: number;
	// eslint-disable-next-line no-unused-vars
	onChange: (val: number) => void;
	onRefreshClick: () => void;
}) => {
	return (
		<Pane display="flex" alignItems="center" margin={12}>
			<TextInputField
				label={title}
				type="number"
				value={value}
				onChange={(e) => {
					return onChange(e.target.value);
				}}
			/>
			<IconButton icon={RefreshIcon} onClick={onRefreshClick} intent="success" />
			<Button
				onClick={() => {
					return onChange(value * 2);
				}}
			>
				* 2
			</Button>
			<Button
				onClick={() => {
					return onChange(value / 2);
				}}
			>
				/ 2
			</Button>
		</Pane>
	);
};

const ParamsPicker = ({ redeemLogic, strike, setStrike, notional, setNotional, isCall, setIsCall }) => {
	// setStrikeToDefaultValue
	return (
		<Box sx={{ marginY: 2 }}>
			{/* <b>{'SELECT CONTRACT PARAMETERS'}</b> */}
			{/* <StrikePicker title="Strike" value={strike} onChange={setStrike} onRefreshClick={setStrikeToDefaultValue} /> */}
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
					onChange={(e) => setStrike(e.target.value)}
				/>
				{(redeemLogic === 'forward' || redeemLogic === 'settled_forward' || redeemLogic === 'vanilla_option') && (
					<TextField
						sx={{ alignItems: 'center', marginX: 2 }}
						label="Notional"
						variant="standard"
						type="number"
						InputLabelProps={{
							shrink: true
						}}
						value={notional}
						onChange={(e) => setNotional(e.target.value)}
					/>
				)}
				{(redeemLogic === 'digital' || redeemLogic === 'vanilla_option') && (
					<FormGroup>
						<FormControlLabel control={<Switch checked={isCall} onChange={(e) => setIsCall(e.target.checked)} />} label={isCall ? 'Call' : 'Put'} />
					</FormGroup>
				)}
			</Box>
		</Box>
	);
};

export default ParamsPicker;
