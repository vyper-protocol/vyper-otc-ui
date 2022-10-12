import { Button, ButtonGroup, TextField } from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers';
import { Pane } from 'evergreen-ui';
import moment from 'moment';

type DateTimePickerCompInput = {
	// title of input component
	title: string;

	// current select value, datetime expressed in ms
	value: number;

	// on change callback, will return the provided datetime expressed in ms
	// eslint-disable-next-line no-unused-vars
	onChange: (val: number) => void;
};

// eslint-disable-next-line no-unused-vars
const DateTimePickerComp = ({ title, value, onChange }: DateTimePickerCompInput) => {
	const auxButtons = [
		{
			label: 'now',
			onClick: () => onChange(moment().toDate().getTime())
		},
		{
			label: '+ 5min',
			onClick: () => onChange(moment(value).add(5, 'minutes').toDate().getTime())
		},
		{
			label: '+ 1w',
			onClick: () => onChange(moment(value).add(1, 'week').toDate().getTime())
		}
	];

	return (
		<Pane margin={6}>
			<DateTimePicker
				renderInput={(props) => <TextField {...props} helperText={moment(value).fromNow()} />}
				label={title}
				value={value}
				onChange={(newValue) => {
					// setAuxValue(newValue);
					onChange(newValue);
				}}
			/>
			<Pane display="flex" alignItems="center">
				<ButtonGroup variant="outlined">
					{auxButtons.map(({ label, onClick }, i) => (
						<Button key={i} onClick={onClick}>
							{label}
						</Button>
					))}
				</ButtonGroup>
			</Pane>
		</Pane>
	);
};

export default DateTimePickerComp;
