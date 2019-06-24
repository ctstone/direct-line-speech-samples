// https://github.com/Microsoft/Recognizers-Text/tree/master/JavaScript/packages/datatypes-date-time

declare module '@microsoft/recognizers-text-data-types-timex-expression' {
  export class Time {
    hour: number;
    minute: number;
    second: number;

    constructor(hour: number, minute: number, second: number);

    getTime(): number;
  }

  export class TimexProperty {
    constructor(timex: Constraint);

    timex: string;
    types: Set<string>;
    toString(): string;
    toNaturalLanguage(referenceDate: Date): string;

    static fromDate(date: Date): TimexProperty;
    static fromDateTime(date: Date): TimexProperty;
    static fromTime(time: Constraint): TimexProperty;
  }

  export class TimexSet {
    timex: TimexProperty;
    constructor(timex: Constraint);
  }

  export const creator: Creator;
  export const resolver: Resolver;
  export type CreateDate = (date: Date) => string;
  export type Constraint = string | Timex;

  export interface Resolver {
    evaluate(candidates: Constraint[], constraints: Constraint[]): TimexProperty[];
  }


  export interface Creator {
    today: CreateDate;
    tomorrow: CreateDate;
    yesterday: CreateDate;
    weekFromToday: CreateDate;
    weekBackFromToday: CreateDate;
    thisWeek: CreateDate;
    nextWeek: CreateDate;
    lastWeek: CreateDate;
    nextWeeksFromToday: (n: number, date: Date) => string;
    monday: 'XXXX-WXX-1';
    tuesday: 'XXXX-WXX-2';
    wednesday: 'XXXX-WXX-3';
    thursday: 'XXXX-WXX-4';
    friday: 'XXXX-WXX-5';
    saturday: 'XXXX-WXX-6';
    sunday: 'XXXX-WXX-7';
    morning: '(T08,T12,PT4H)';
    afternoon: '(T12,T16,PT4H)';
    evening: '(T16,T20,PT4H)';
    daytime: '(T08,T18,PT10H)';
  }

  export interface Timex {
    year: number;
    month: number;
    dayOfMonth: number;
    hour: number;
    minute: number;
    second: number;
  }

}