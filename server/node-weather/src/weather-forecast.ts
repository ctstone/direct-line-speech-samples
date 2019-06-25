import DarkSky, { DataPoint, DataPointCurrently, DataPointDaily, DataPointHourly, Flags, Units } from 'dark-sky';

import { Location, LocationResolver } from './location';
import { DateTime, findTime, findTimeRange, RelativeDateTime, resolveDate } from './time';
import { WeatherForecastConditions } from './weather-conditions';

export interface Forecast {
  location: Location;
  flags: Flags;
  date: DateTime;
  summary: string;
  currently?: DataPointCurrently;
  hourly?: DataPointHourly[];
  daily?: DataPointDaily[];
  hour?: DataPointHourly;
  day?: DataPointDaily;
}

export interface WeatherOptions {
  units?: Units;
  language?: string;
}

const DEFAULT_LANGUAGE = 'en';
const DEFAULT_UNITS = 'us';

export class WeatherForecast {

  conditions = new WeatherForecastConditions(this);

  constructor(private loc: LocationResolver, private ds: DarkSky) {
  }

  lookup(place: string, relativeDate: RelativeDateTime, options?: WeatherOptions) {
    switch (relativeDate.type) {
      case 'date':
      case 'datetime':
        return this.forDate(place, relativeDate, options);

      case 'time':
        return this.forTime(place, relativeDate, options);

      case 'daterange':
        return this.forDateRange(place, relativeDate, options);

      case 'datetimerange':
      case 'timerange':
        return this.forTimeRange(place, relativeDate, options);
    }
  }

  async forDate(place: string, relativeDate: RelativeDateTime, options?: WeatherOptions): Promise<Forecast> {
    const location = await this.loc.resolve(place);
    console.log('LOCATION', location);
    const forecast = await this.getWeather(location, options);
    if (forecast) {
      const { daily, flags } = forecast;
      const date = resolveDate(relativeDate, location.timezone);
      console.log('DATE', relativeDate, date);
      const day = findTime(date.start, 'day', daily.data);
      if (day) {
        const { summary } = day;
        return { location, day, flags, date, summary };
      }
    }
  }

  async forTime(place: string, relativeTime: RelativeDateTime, options?: WeatherOptions): Promise<Forecast> {
    const location = await this.loc.resolve(place);
    const forecast = await this.getWeather(location, options);
    if (forecast) {
      const { hourly, flags } = forecast;
      const date = resolveDate(relativeTime, location.timezone);
      const hour = findTime(date.start, 'hour', hourly.data);
      if (hour) {
        const { summary } = hour;
        return { location, hour, flags, date, summary };
      }
    }
  }

  async forDateRange(place: string, relativeDate: RelativeDateTime, options?: WeatherOptions): Promise<Forecast> {
    const location = await this.loc.resolve(place);
    const forecast = await this.getWeather(location, options);
    if (forecast) {
      const { daily: allDaily, flags } = forecast;
      const date = resolveDate(relativeDate, location.timezone);
      const daily = findTimeRange(date.start, date.end, allDaily.data);
      if (daily.length) {
        const summary = getSummaryForDateRange(daily);
        return { location, daily, flags, date, summary };
      }
    }
  }

  async forTimeRange(place: string, relativeTime: RelativeDateTime, options?: WeatherOptions): Promise<Forecast> {
    const location = await this.loc.resolve(place);
    const forecast = await this.getWeather(location, options);
    if (forecast) {
      const { hourly: allHourly, flags } = forecast;
      const date = resolveDate(relativeTime, location.timezone);
      const hourly = findTimeRange(date.start, date.end, allHourly.data);
      if (hourly.length) {
        const summary = getSummaryForDateRange(hourly);
        return { location, hourly, flags, date, summary };
      }
    }
  }

  async forCurrent(place: string, options?: WeatherOptions): Promise<Forecast> {
    const location = await this.loc.resolve(place);
    const forecast = await this.getWeather(location, options);
    if (forecast) {
      const { currently, flags } = forecast;
      const date: DateTime = { type: 'datetime', start: new Date() };
      const { summary } = currently;
      return { location, currently, flags, date, summary };
    }
  }

  private async getWeather(location: Location, options: WeatherOptions = {}) {
    if (location) {
      const { coordinates: [lat, lon] } = location;
      const { units, language } = options;
      return this.ds
        .latitude(lat)
        .longitude(lon)
        .exclude(['minutely'])
        .language(language || DEFAULT_LANGUAGE)
        .units(units || DEFAULT_UNITS)
        .get();
    }
  }
}

function getSummaryForDateRange(range: DataPoint[]) {
  const set = new Set<string>(range.map((x) => x.summary));
  const uniq = Array.from(set);

  if (uniq.length === 1) {
    return uniq[0];
  } else if (uniq.length === 2) {
    return uniq.join(' and ');
  } else {
    return uniq.slice(0, uniq.length - 1).join(', ') + ' and ' + uniq[uniq.length - 1];
  }
}
