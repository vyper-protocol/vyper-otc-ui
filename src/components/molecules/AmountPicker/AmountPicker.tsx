import { Box, Button, ButtonGroup, InputAdornment, TextField } from '@mui/material';

type AmountPickerInput = {
	// title of input component
	title: string;

	// current input value
	value: number;

	// on change callback, will return the provided number
	// eslint-disable-next-line no-unused-vars
	onChange: (_: number) => void;

	// reset value
	resetValue?: number;

	// values for increment buttons
	incrementValues?: [number, number];
};

const getDisplayString = (value: number): string => {
	const baseString = Math.abs(value).toString();
	if (value >= 0) {
		return `+ ${baseString}`;
	} else {
		return `- ${baseString}`;
	}
};

const AmountPicker = ({ title, value, onChange, resetValue, incrementValues }: AmountPickerInput) => {
	resetValue = resetValue ?? 100;
	incrementValues = incrementValues ?? [100, -100];

	return (
		<Box sx={{ display: 'flex', alignItems: 'center', marginY: 6 }}>
			<TextField
				size="small"
				label={title}
				variant="outlined"
				value={value}
				onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
					return onChange(Number(e.target.value));
				}}
				InputProps={{
					endAdornment: (
						<InputAdornment position="end">
							<ButtonGroup variant="text">
								<Button
									onClick={() => {
										return onChange(resetValue);
									}}
								>
									reset
								</Button>
								<Button
									// variant="outlined"
									onClick={() => {
										return onChange(value + incrementValues[0]);
									}}
								>
									{getDisplayString(incrementValues[0])}
								</Button>
								<Button
									// variant="outlined"
									onClick={() => {
										return onChange(value + incrementValues[1]);
									}}
								>
									{getDisplayString(incrementValues[1])}
								</Button>
							</ButtonGroup>
						</InputAdornment>
					)
				}}
			/>
		</Box>
	);
};

export default AmountPicker;
