import { useState } from 'react';

import { TextField, ToggleButton, Typography, Grid, Stack } from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers';

type PillarType = {
	label: string;
	onClick: () => void;
};

type DateTimePickerCompInput = {
	// title of input component
	title: string;

	// current select value, datetime expressed in ms
	value: number;

	// on change callback, will return the provided datetime expressed in ms
	// eslint-disable-next-line no-unused-vars
	onChange: (val: number) => void;

	// List with possible selectors
	pillars: PillarType[];
};

// eslint-disable-next-line no-unused-vars
const DateTimePickerComp = ({ title, value, onChange, pillars }: DateTimePickerCompInput) => {
	const [selected, setSelected] = useState(pillars[0].label);

	const handleChange = (_, pillarLabel: string) => {
		setSelected(pillarLabel);

		pillars.find(({ label }) => label === pillarLabel).onClick();
	};

	return (
		<Stack spacing={1} sx={{ alignItems: 'flex-start' }}>
			<Typography sx={{ fontWeight: '600' }}>{title}</Typography>
			<Stack spacing={1} sx={{ display: 'flex', alignItems: 'center' }}>
				<DateTimePicker
					renderInput={(props) => <TextField {...props} />}
					value={value}
					inputFormat="DD MMM YYYY - hh:mm A"
					disableMaskedInput
					disablePast
					onChange={(newValue) => {
						onChange(newValue);
					}}
				/>

				<Grid container spacing={0.1} sx={{ width: '80%' }}>
					{pillars.map(({ label }, i) => (
						<Grid item xs={4} key={i} sx={{ justifyContent: 'center', alignItems: 'center' }}>
							<ToggleButton
								key={i}
								value={label}
								sx={{
									textTransform: 'none',
									fontSize: 12,
									padding: 0,
									margin: 0,
									border: 'none',
									'&.Mui-disabled': {
										border: 0
									},
									'&:not(:first-of-type)': {
										borderRadius: 1
									}
								}}
								size="small"
								fullWidth={true}
								selected={label === selected}
								onChange={handleChange}
							>
								{label}
							</ToggleButton>
						</Grid>
					))}
				</Grid>
			</Stack>
		</Stack>
	);
};

export default DateTimePickerComp;
