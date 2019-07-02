import moment from 'moment';
import 'moment-timezone';

export interface Time {
  /** UNIX epoch in seconds */
  time: number;
}

export type DateTimeType
  = 'date' // tomorrow
  | 'daterange' // this week
  | 'datetime' // tonight
  | 'datetimerange' // tomorrow afternoon
  | 'time' // 10 am
  | 'timerange' // from 10 am to 12 pm
  | 'duration'
  | 'set';

export interface RelativeDateTime {
  type: DateTimeType;
  value?: string;
  start?: string;
  end?: string;
}

export interface DateTime {
  type: DateTimeType;
  start: Date;
  end?: Date;
}

/**
 * Find the latest candidate with a date that is less than a target date.
 * @param date the time to look for
 * @param granularity date granularity (same day/hour/etc)
 * @param candidates sorted list of candidates to compare (timezone adjusted)
 */
export function findTime<T extends Time>(date: Date, granularity: moment.unitOfTime.StartOf, candidates: T[]): T {
  const target = getTimestamp(moment.utc(date).startOf(granularity).toDate());
  const time = candidates.find(({ time }, i, array) => {
    const next = array[i + 1];
    return target >= time && target >= time && (!next || target < next.time);
  });
  return time && moment.utc(date).isSame(time.time * 1000, granularity) ? time : null;
}

/**
 * Find the latest candidate with a date that is less than a target date.
 * @param startDate start date to include (inclusive)
 * @param endDate end date to include (exclusive)
 * @param candidates sorted list of candidates to compare
 * @param timezone IANA timezone label associated with the candidate times
 */
export function findTimeRange<T extends Time>(startDate: Date, endDate: Date, candidates: T[]): T[] {
  const start = getTimestamp(startDate);
  const end = getTimestamp(endDate);
  return candidates.filter((x) => x.time >= start && x.time < end);
}

export function createDate(seconds: number) {
  return new Date(seconds * 1000);
}

export function getTimestamp(date: Date) {
  return date.getTime() / 1000;
}

/** Return a date object representing the given time as of today */
export function parseTime(time: string, timezone: string) {
  const [hours, minutes, seconds] = time.split(':').map((x) => +x);
  return moment.tz(timezone).set({ hours, minutes, seconds }).toDate();
}

export function resolveDate(relativeDateTime: RelativeDateTime, timezone: string): DateTime {
  const { type, value: dateText, start: startText, end: endText } = relativeDateTime;

  let start: Date;
  let end: Date;

  switch (type) {
    case 'date':
    case 'datetime':
      start = moment.tz(dateText, timezone).toDate();
      break;

    case 'daterange':
    case 'datetimerange':
      start = moment.tz(startText, timezone).toDate();
      end = moment.tz(endText, timezone).toDate();
      break;

    case 'time':
      start = parseTime(dateText, timezone);
      break;

    case 'timerange':
      start = parseTime(startText, timezone);
      end = parseTime(endText, timezone);
      break;
  }

  return { type, start, end };
}
