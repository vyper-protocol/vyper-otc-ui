import moment from 'moment';

export const momentDate = (timestamp: number, formatString: string = 'd/M/YY HH:mm:ss') => {
	const date = moment(timestamp).format(formatString);
	return date;
};

export const momentDuration = (timestamp: number) => {
	const duration = moment.duration(timestamp).humanize();
	return duration;
};

// TODO too messy, refactor

export function getNextHour(minuteCutoff: number) {
	const now = moment();
	return now.minutes() <= minuteCutoff ? now.add(61, 'minutes').startOf('hour') : now.add(61 + 60 - minuteCutoff, 'minutes').startOf('hour');
}

export function getNextDay(utcHourCutoff: number) {
	const now = moment.utc();
	return now.hour() < utcHourCutoff
		? now.startOf('day').add(utcHourCutoff, 'hour').local()
		: now.add(23, 'hour').startOf('day').add(utcHourCutoff, 'hour').local();
}

export function getTomNextDay(utcHourCutoff: number) {
	const now = moment.utc();
	return now.hour() < utcHourCutoff
		? now.add(25, 'hour').startOf('day').add(utcHourCutoff, 'hour').local()
		: now.add(49, 'hour').startOf('day').add(utcHourCutoff, 'hour').local();
}

export function getUtcNextMonth(utcHour: number, next = false) {
	return (next ? moment.utc().add(1, 'month') : moment.utc()).endOf('month').startOf('day').add(utcHour, 'hour');
}

export function getUtcNextQuarter(utcHour: number, next = false) {
	return (next ? moment.utc().add(1, 'quarter') : moment.utc()).endOf('quarter').startOf('day').add(utcHour, 'hour');
}

export function moveToDayOfWeek(currentMoment: moment.Moment, dayOfWeek: number, orient = 1) {
	const diff = (dayOfWeek - currentMoment.isoWeekday() + 7 * orient) % 7;
	return currentMoment.clone().add(diff === 0 ? 7 * orient : diff, 'day');
}

export function getNextFriday(utcHour: number) {
	return moveToDayOfWeek(moment.utc(), 5).startOf('day').add(utcHour, 'hour').local();
}

export function getLastFridayOfMonth(utcHour: number) {
	const thisMonthEnd = getUtcNextMonth(utcHour, true);
	const thisMonthFridayEnd = moveToDayOfWeek(thisMonthEnd, 5, -1);

	const nextMonthEnd = getUtcNextMonth(utcHour, true);
	const nextMonthFridayEnd = moveToDayOfWeek(nextMonthEnd, 5, -1);

	if (thisMonthEnd.isoWeekday() === 5) {
		return thisMonthEnd.local();
	} else if (thisMonthFridayEnd.isAfter(moment.utc())) {
		return thisMonthFridayEnd.local();
	} else if (nextMonthEnd.isoWeekday() === 5) {
		return nextMonthEnd.local();
	} else {
		return nextMonthFridayEnd.local();
	}
}

export function getLastFridayOfQuarter(utcHour: number) {
	const thisQuarterEnd = getUtcNextQuarter(utcHour);
	const thisQuarterFridayEnd = moveToDayOfWeek(thisQuarterEnd, 5, -1);

	const nextQuarterEnd = getUtcNextMonth(utcHour, true);
	const nextQuarterFridayEnd = moveToDayOfWeek(nextQuarterEnd, 5, -1);

	if (thisQuarterEnd.isoWeekday() === 5) {
		return thisQuarterEnd.local();
	} else if (thisQuarterFridayEnd.isAfter(moment.utc())) {
		return thisQuarterFridayEnd.local();
	} else if (nextQuarterEnd.isoWeekday() === 5) {
		return nextQuarterEnd.local();
	} else {
		return nextQuarterFridayEnd.local();
	}
}
