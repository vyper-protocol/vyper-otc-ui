import moment from 'moment';

export const momentDate = (timestamp: number) => {
	const date = moment(timestamp).format('d/M/YY HH:mm::ss');
	return date;
};

export const momentDuration = (timestamp: number) => {
	const duration = moment.duration(timestamp).humanize();
	return duration;
};
