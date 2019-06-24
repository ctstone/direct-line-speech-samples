import * as moment from 'moment';

export interface Time {
  /** UNIX epoch in seconds */
  time: number;
}

export type DateType
  = 'date' // tomorrow
  | 'datetime' // tonight
  | 'daterange' // this week
  | 'time' // 10 am
  | 'datetimerange' // tomorrow afternoon
  | 'timerange'; // from 10 am to 12 pm

/**
 * Find the latest candidate with a date that is less than a target date.
 * @param date the time to look for
 * @param granularity date granularity (same day/hour/etc)
 * @param candidates sorted list of candidates to compare (timezone adjusted)
 */
export function findTime<T extends Time>(date: Date, granularity: moment.unitOfTime.StartOf, candidates: T[]): T {
  const timestamp = getTimestamp(date);
  const time = candidates.find((x, i, array) => timestamp >= x.time && timestamp >= x.time && (!array[i + 1] || timestamp < array[i + 1].time));
  return time && moment(date).isSame(time.time * 1000, granularity) ? time : null;
}

/**
 * Find the latest candidate with a date that is less than a target date.
 * @param startDate start date to include (inclusive)
 * @param endDate end date to include (exclusive)find
 * @param candidates sorted list of candidates to compare
 * @param timezone IANA timezone label associated with the candidate times
 */
export function findTimeRange<T extends Time>(startDate: Date, endDate: Date, candidates: T[]): T[] {
  const start = getTimestamp(startDate);
  const end = getTimestamp(endDate);
  return candidates.filter((x, i, array) => x.time >= start && x.time < end);
}

export function createDate(seconds: number) {
  return new Date(seconds * 1000);
}

export function getTimestamp(date: Date) {
  return date.getTime() / 1000;
}

/** Return a date object representing the given time as of today */
export function parseTime(time: string) {
  const [hours, minutes, seconds] = time.split(':').map((x) => +x);
  return moment.utc().set({ hours, minutes, seconds }).toDate();
}

export function resolveDate(text: string, type: DateType, timezone: string) {

}
