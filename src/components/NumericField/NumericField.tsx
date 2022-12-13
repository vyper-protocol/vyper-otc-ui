import { TextField } from '@mui/material';

interface NumericFieldProps {
	label: string;
	value: number;
	onChange: (newValue: number) => void;
}

const NumericField = ({ label, value, onChange }: NumericFieldProps) => {
	return (
		<TextField
			sx={{
				alignItems: 'center',
				marginX: 2,
				'& input[type=number]': {
					'-moz-appearance': 'textfield'
				},
				'& input[type=number]::-webkit-outer-spin-button': {
					'-webkit-appearance': 'none',
					margin: 0
				},
				'& input[type=number]::-webkit-inner-spin-button': {
					'-webkit-appearance': 'none',
					margin: 0
				}
			}}
			label={label}
			variant="standard"
			type="number"
			onFocus={(event) => {
				event.target.select();
			}}
			InputLabelProps={{
				shrink: true
			}}
			value={value}
			onChange={(e) => onChange(+e.target.value)}
		/>
	);
};

export default NumericField;
