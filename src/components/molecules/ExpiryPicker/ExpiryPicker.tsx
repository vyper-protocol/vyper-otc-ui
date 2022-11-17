import { useState } from 'react';

import WatchLaterIcon from '@mui/icons-material/WatchLater';
import WatchLaterOutlinedIcon from '@mui/icons-material/WatchLaterOutlined';
import { Box, Checkbox } from '@mui/material';
import FormControlLabel from '@mui/material/FormControlLabel';
import DateTimePickerComp from 'components/molecules/DateTimePickerComp';

const ExpiryPicker = ({ depositEnd, setDepositEnd, settleStart, setSettleStart }) => {
	const [showExact, setShowExact] = useState(false);

	return (
		<Box sx={{ alignItems: 'center', marginY: 2 }}>
			{/* <b>{'SELECT EXPIRY'}</b> */}
			<Box sx={{ marginY: 2 }}>
				<FormControlLabel
					control={<Checkbox icon={<WatchLaterOutlinedIcon />} checkedIcon={<WatchLaterIcon />} onChange={(_, checked) => setShowExact(checked)} />}
					label="Exact date"
					labelPlacement="end"
				/>
			</Box>
			<Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
				<DateTimePickerComp title="Deposit Expiry" value={depositEnd} onChange={setDepositEnd} showExact={showExact} />
				<DateTimePickerComp title="Contract Expiry" value={settleStart} onChange={setSettleStart} showExact={showExact} />
			</Box>
		</Box>
	);
};

export default ExpiryPicker;
