import * as DarkSky from 'dark-sky';

import { Location, LocationResolver } from './location';
import { findTime, findTimeRange } from './time';

export interface Forecast {
  location: Location;
  flags: DarkSky.Flags;
  currently?: DarkSky.DataPointCurrently;
  hourly?: DarkSky.DataPointHourly[];
  daily?: DarkSky.DataPointDaily[];
  hour?: DarkSky.DataPointHourly;
  day?: DarkSky.DataPointDaily;
}

export class WeatherForecast {
  constructor(private loc: LocationResolver, private ds: DarkSky) {
  }

  async forDate(place: string, date: Date, unitsType: DarkSky.Units): Promise<Forecast> {
    const location = await this.loc.resolve(place);
    const { daily, flags } = await this.getWeather(location, unitsType);
    const day = findTime(date, 'day', daily.data);
    return { location, day, flags };
  }

  async forTime(place: string, time: Date, unitsType: DarkSky.Units): Promise<Forecast> {
    const location = await this.loc.resolve(place);
    const { hourly, flags } = await this.getWeather(location, unitsType);
    const hour = findTime(time, 'hour', hourly.data);
    return { location, hour, flags };
  }

  async forDateRange(place: string, startDate: Date, endDate: Date, unitsType: DarkSky.Units): Promise<Forecast> {
    const location = await this.loc.resolve(place);
    const { daily: allDaily, flags } = await this.getWeather(location, unitsType);
    const daily = findTimeRange(startDate, endDate, allDaily.data);
    return { location, daily, flags };
  }

  async forTimeRange(place: string, startTime: Date, endTime: Date, unitsType: DarkSky.Units): Promise<Forecast> {
    const location = await this.loc.resolve(place);
    const { hourly: allHourly, flags } = await this.getWeather(location, unitsType);
    const hourly = findTimeRange(startTime, endTime, allHourly.data);
    return { location, hourly, flags };
  }

  async forCurrent(place: string, unitsType: DarkSky.Units): Promise<Forecast> {
    const location = await this.loc.resolve(place);
    const { currently, flags } = await this.getWeather(location, unitsType);
    return { location, currently, flags };
  }

  private async getWeather(location: Location, unitsType: DarkSky.Units) {
    const { coordinates: [lat, lon] } = location;
    return this.ds.latitude(lat).longitude(lon).exclude(['minutely']).units(unitsType).get();
  }
}
