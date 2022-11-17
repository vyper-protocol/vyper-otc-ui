import { Tooltip } from '@mui/material';
import moment from 'moment';

type MomentTooltipSpanInput = {
	// date time value in milliseconds
	datetime: number;

	// optional timeformat string
	timeFormat?: string;
};

const MomentTooltipSpan = ({ datetime, timeFormat }: MomentTooltipSpanInput) => {
	return (
		<Tooltip title={moment(datetime).format(timeFormat ?? 'D MMM yyyy hh:mm a')} placement="right">
			<span>{moment(datetime).fromNow()}</span>
		</Tooltip>
	);
};

export default MomentTooltipSpan;
