import { useEffect, useState } from 'react';

import { Alert, Collapse, Grid } from '@mui/material';
import ErrorAlert from 'components/atoms/ErrorAlert/ErrorAlert';
import DateTimePickerComp from 'components/molecules/DateTimePickerComp';
import moment from 'moment';
import { getNextHour, getNextDay, getTomNextDay, getNextFriday, getLastFridayOfMonth, getLastFridayOfQuarter } from 'utils/momentHelpers';

// TODO fix typing
export type ExpiryPickerInput = {
	// end of the deposit period expressed in ms
	depositEnd: number;

	// set callback, returns the provided datetime expressed in ms
	// eslint-disable-next-line no-unused-vars
	setDepositEnd: (val: number) => void;

	// contract expiry expressed in ms
	settleStart: number;

	// set callback, returns the provided datetime expressed in ms
	// eslint-disable-next-line no-unused-vars
	setSettleStart: (val: number) => void;
};

export type ExpiryPickerProps = ExpiryPickerInput & {
	// error in expiry inputs
	expiryError: boolean;

	// eslint-disable-next-line no-unused-vars
	setExpiryError: (error: boolean) => void;
};

export const ExpiryPicker = ({ depositEnd, setDepositEnd, settleStart, setSettleStart, expiryError, setExpiryError }: ExpiryPickerProps) => {
	// at the 30th minute go to next hourly slot
	const minuteCutoff = 30;

	// 9 AM UTC expiries
	const utcHour = 9;

	const [open, setOpen] = useState(true);

	useEffect(() => {
		if (settleStart < depositEnd) {
			setExpiryError(true);
		} else {
			setExpiryError(false);
		}
	}, [depositEnd, setDepositEnd, settleStart, setExpiryError]);

	const depositPillar = [
		{ label: '5 min', onClick: () => setDepositEnd(moment().add(5, 'minutes').toDate().getTime()) },
		{ label: '15 min', onClick: () => setDepositEnd(moment().add(15, 'minutes').toDate().getTime()) },
		{ label: '30 min', onClick: () => setDepositEnd(moment().add(30, 'minutes').toDate().getTime()) },
		{ label: '1 hour', onClick: () => setDepositEnd(moment().add(1, 'hour').toDate().getTime()) },
		{ label: '12 hours', onClick: () => setDepositEnd(moment().add(12, 'hour').toDate().getTime()) },
		{ label: '1 day', onClick: () => setDepositEnd(moment().add(1, 'day').toDate().getTime()) }
	];

	const expiryPillars = [
		{ label: 'Hourly', onClick: () => setSettleStart(getNextHour(minuteCutoff).toDate().getTime()) },
		{ label: 'Daily', onClick: () => setSettleStart(getNextDay(utcHour).toDate().getTime()) },
		{ label: 'DailyNext', onClick: () => setSettleStart(getTomNextDay(utcHour).toDate().getTime()) },
		{ label: 'Weekly', onClick: () => setSettleStart(getNextFriday(utcHour).toDate().getTime()) },
		{ label: 'Monthly', onClick: () => setSettleStart(getLastFridayOfMonth(utcHour).toDate().getTime()) },
		{ label: 'Quarterly', onClick: () => setSettleStart(getLastFridayOfQuarter(utcHour).toDate().getTime()) }
	];

	return (
		<Grid container spacing={1} sx={{ mt: 2 }}>
			<Grid item xs={12}>
				<Collapse in={open}>
					<Alert severity="info" onClose={() => setOpen(false)}>
						We highly suggest to pick one of the below expiries to increase the probability of trade.
					</Alert>
				</Collapse>
				{/* <Button onClick={() => setOpen(true)}>open alert</Button> */}
			</Grid>
			<Grid item xs={6}>
				<DateTimePickerComp title="Deposit Expiry" value={depositEnd} onChange={setDepositEnd} pillars={depositPillar} />
			</Grid>
			<Grid item xs={6}>
				<DateTimePickerComp title="Contract Expiry" value={settleStart} onChange={setSettleStart} pillars={expiryPillars} />
			</Grid>

			{expiryError && (
				<Grid item xs={12}>
					<ErrorAlert message={'Contract expiry should be after the deposit expiry!'} />
				</Grid>
			)}
		</Grid>
	);
};
