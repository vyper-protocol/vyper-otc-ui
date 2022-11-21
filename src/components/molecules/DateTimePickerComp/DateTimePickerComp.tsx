import { Button, ButtonGroup, TextField } from '@mui/material';
import { Box } from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers';
import moment from 'moment';

type DateTimePickerCompInput = {
	// title of input component
	title: string;

	// current select value, datetime expressed in ms
	value: number;

	// on change callback, will return the provided datetime expressed in ms
	// eslint-disable-next-line no-unused-vars
	onChange: (val: number) => void;

	// show the exact date or not
	showExact: boolean;
};

// eslint-disable-next-line no-unused-vars
const DateTimePickerComp = ({ title, value, onChange, showExact }: DateTimePickerCompInput) => {
	const auxButtons = [
		{
			label: 'Reset',
			onClick: () => onChange(moment().toDate().getTime())
		},
		{
			label: '+ 5min',
			onClick: () => onChange(moment(value).add(5, 'minutes').toDate().getTime())
		},
		{
			label: '+ 1d',
			onClick: () => onChange(moment(value).add(1, 'day').toDate().getTime())
		},
		{
			label: '+ 1w',
			onClick: () => onChange(moment(value).add(1, 'week').toDate().getTime())
		}
	];

	return (
		<Box sx={{ mr: 2 }}>
			<b>{title}</b>

			{showExact && (
				<Box sx={{ mb: 2 }}>
					<DateTimePicker
						renderInput={(props) => <TextField {...props} />}
						value={value}
						onChange={(newValue) => {
							// setAuxValue(newValue);
							onChange(newValue);
						}}
					/>
				</Box>
			)}

			<Box display="flex" alignItems="center">
				<ButtonGroup variant="outlined">
					{auxButtons.map(({ label, onClick }, i) => (
						<Button key={i} onClick={onClick} sx={{ m: 1 }}>
							{label}
						</Button>
					))}
				</ButtonGroup>
			</Box>
			<p>{moment(value).fromNow()}</p>
		</Box>
	);
};

export default DateTimePickerComp;
