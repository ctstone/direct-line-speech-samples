import { Alert, DataBlock, DataPointCurrently, DataPointDaily, DataPointHourly, Forecast } from 'dark-sky';
import moment, { Moment } from 'moment';
import 'moment-timezone';

export interface MockForecastOptions {
  longitude: number;
  latitude: number;
  timezone: string;
}

export function mockForecast(d: string, options?: MockForecastOptions): Forecast {
  const {
    longitude,
    latitude,
    timezone } = Object.assign({
      longitude: 1,
      latitude: 2,
      timezone: 'America/New_York',
    }, options);

  const mDate = moment.tz(d, timezone);
  const currently = mockCurrently(mDate.clone());
  const minutely = mockMinutely(mDate.clone().startOf('minute'));
  const hourly = mockHourly(mDate.clone().startOf('day'));
  const daily = mockDaily(mDate.clone().startOf('day'));
  const alerts: Alert[] = [];
  const flags = { units: 'us' as const };

  return {
    longitude,
    latitude,
    timezone,
    currently,
    minutely,
    hourly,
    daily,
    alerts,
    flags,
  };
}

function mockDaily(date: Moment): DataBlock<DataPointDaily> {
  const end = date.clone().add(7, 'day').startOf('day');
  const summary = 'Mixed precipitation throughout the week, with temperatures falling to 39°F on Saturday.';
  const icon = 'rain';
  const data: DataPointDaily[] = [];
  while (date <= end) {
    const time = date.unix();
    date.add(1, 'day');
    data.push({
      time,
      summary: "Rain starting in the afternoon, continuing until evening.",
      icon: "rain",
      sunriseTime: time,
      sunsetTime: time,
      moonPhase: 0.59,
      precipIntensity: 0.0088,
      precipIntensityMax: 0.0725,
      precipIntensityMaxTime: time,
      precipProbability: 0.73,
      precipType: "rain",
      temperatureHigh: 66.35,
      temperatureHighTime: time,
      temperatureLow: 41.28,
      temperatureLowTime: time,
      apparentTemperatureHigh: 66.53,
      apparentTemperatureHighTime: time,
      apparentTemperatureLow: 35.74,
      apparentTemperatureLowTime: time,
      dewPoint: 57.66,
      humidity: 0.86,
      pressure: 1012.93,
      windSpeed: 3.22,
      windGust: 26.32,
      windGustTime: time,
      windBearing: 270,
      cloudCover: 0.8,
      uvIndex: 2,
      uvIndexTime: time,
      visibility: 10,
      ozone: 269.45,
      temperatureMin: 52.08,
      temperatureMinTime: time,
      temperatureMax: 66.35,
      temperatureMaxTime: time,
      apparentTemperatureMin: 52.08,
      apparentTemperatureMinTime: time,
      apparentTemperatureMax: 66.53,
      apparentTemperatureMaxTime: time,
    });
  }
  return { summary, icon, data };
}

function mockHourly(date: Moment): DataBlock<DataPointHourly> {
  const end = date.clone().add(1, 'day').startOf('day');
  const summary = "Snow (6–9 in.) and windy starting in the afternoon.";
  const icon = "snow";
  const data: DataPointHourly[] = [];
  while (date <= end) {
    const time = date.unix();
    date.add(1, 'hour');
    data.push({
      time,
      summary: "Mostly Cloudy",
      icon: "partly-cloudy-night",
      precipIntensity: 0,
      precipProbability: 0,
      temperature: 22.8,
      apparentTemperature: 16.46,
      dewPoint: 15.51,
      humidity: 0.73,
      pressure: 1026.78,
      windSpeed: 4.83,
      windBearing: 354,
      cloudCover: 0.78,
      uvIndex: 0,
      visibility: 9.62,
    });
  }
  return { summary, icon, data };
}

function mockMinutely(date: Moment): DataBlock {
  return null;
}

function mockCurrently(date: Moment): DataPointCurrently {
  const time = date.unix();

  return {
    time,
    summary: "Drizzle",
    icon: "rain",
    nearestStormDistance: 0,
    precipIntensity: 0.0089,
    precipIntensityError: 0.0046,
    precipProbability: 0.9,
    precipType: "rain",
    temperature: 66.1,
    apparentTemperature: 66.31,
    dewPoint: 60.77,
    humidity: 0.83,
    pressure: 1010.34,
    windSpeed: 5.59,
    windGust: 12.03,
    windBearing: 246,
    cloudCover: 0.7,
    uvIndex: 1,
    visibility: 9.84,
    ozone: 267.44,
  };
}
