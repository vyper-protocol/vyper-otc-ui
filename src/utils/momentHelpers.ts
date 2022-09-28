import moment from 'moment';

export const momentDate = (timestamp: number, formatString: string = 'd/M/YY HH:mm:ss') => {
	const date = moment(timestamp).format(formatString);
	return date;
};

export const momentDuration = (timestamp: number) => {
	const duration = moment.duration(timestamp).humanize();
	return duration;
};
