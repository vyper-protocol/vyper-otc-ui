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
		<Tooltip arrow title={moment(datetime).format(timeFormat ?? 'DD MMM YYYY - hh:mm A')} placement="right">
			<span>{moment(datetime).fromNow()}</span>
		</Tooltip>
	);
};

export default MomentTooltipSpan;
