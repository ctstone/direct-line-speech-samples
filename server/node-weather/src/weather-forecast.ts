import * as DarkSky from 'dark-sky';

import { Location, LocationResolver } from './location';
import { DateTime, findTime, findTimeRange, RelativeDateTime, resolveDate } from './time';

export interface Forecast {
  location: Location;
  flags: DarkSky.Flags;
  date: DateTime;
  currently?: DarkSky.DataPointCurrently;
  hourly?: DarkSky.DataPointHourly[];
  daily?: DarkSky.DataPointDaily[];
  hour?: DarkSky.DataPointHourly;
  day?: DarkSky.DataPointDaily;
}

export class WeatherForecast {
  constructor(private loc: LocationResolver, private ds: DarkSky) {
  }

  lookup(place: string, relativeDate: RelativeDateTime, unitsType: DarkSky.Units) {
    switch (relativeDate.type) {
      case 'date':
      case 'datetime':
        return this.forDate(place, relativeDate, unitsType);

      case 'time':
        return this.forTime(place, relativeDate, unitsType);

      case 'daterange':
      case 'datetimerange':
        return this.forDateRange(place, relativeDate, unitsType);

      case 'timerange':
        return this.forTimeRange(place, relativeDate, unitsType);
    }
  }

  async forDate(place: string, relativeDate: RelativeDateTime, unitsType: DarkSky.Units): Promise<Forecast> {
    const location = await this.loc.resolve(place);
    const { daily, flags } = await this.getWeather(location, unitsType);
    const date = resolveDate(relativeDate, location.timezone);
    const day = findTime(date.start, 'day', daily.data);
    return { location, day, flags, date };
  }

  async forTime(place: string, relativeTime: RelativeDateTime, unitsType: DarkSky.Units): Promise<Forecast> {
    const location = await this.loc.resolve(place);
    const { hourly, flags } = await this.getWeather(location, unitsType);
    const date = resolveDate(relativeTime, location.timezone);
    const hour = findTime(date.start, 'hour', hourly.data);
    return { location, hour, flags, date };
  }

  async forDateRange(place: string, relativeDate: RelativeDateTime, unitsType: DarkSky.Units): Promise<Forecast> {
    const location = await this.loc.resolve(place);
    const { daily: allDaily, flags } = await this.getWeather(location, unitsType);
    const date = resolveDate(relativeDate, location.timezone);
    const daily = findTimeRange(date.start, date.end, allDaily.data);
    return { location, daily, flags, date };
  }

  async forTimeRange(place: string, relativeTime: RelativeDateTime, unitsType: DarkSky.Units): Promise<Forecast> {
    const location = await this.loc.resolve(place);
    const { hourly: allHourly, flags } = await this.getWeather(location, unitsType);
    const date = resolveDate(relativeTime, location.timezone);
    const hourly = findTimeRange(date.start, date.end, allHourly.data);
    return { location, hourly, flags, date };
  }

  async forCurrent(place: string, unitsType: DarkSky.Units): Promise<Forecast> {
    const location = await this.loc.resolve(place);
    const { currently, flags } = await this.getWeather(location, unitsType);
    const date: DateTime = { type: 'datetime', start: new Date() };
    return { location, currently, flags, date };
  }

  private async getWeather(location: Location, unitsType: DarkSky.Units) {
    const { coordinates: [lat, lon] } = location;
    return this.ds.latitude(lat).longitude(lon).exclude(['minutely']).units(unitsType).get();
  }
}
