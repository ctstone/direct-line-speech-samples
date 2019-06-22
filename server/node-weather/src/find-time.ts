import * as moment from 'moment';

export interface Time {
  /** UNIX epoch in seconds */
  time: number;
}

/**
 * Find the latest candidate with a date that is less than a target date.
 * @param date the time to look for
 * @param granularity date granularity (same day/hour/etc)
 * @param candidates sorted list of candidates to compare (timezone adjusted)
 */
export function findTime<T extends Time>(date: Date, granularity: moment.unitOfTime.StartOf, candidates: T[]): T {
  const d = date.getTime() / 1000;
  const time = candidates.find((x, i, array) => d >= x.time && d >= x.time && (!array[i + 1] || d < array[i + 1].time));
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
  const start = startDate.getTime() / 1000;
  const end = endDate.getTime() / 1000;
  return candidates.filter((x, i, array) => x.time >= start && x.time < end);
}
