import { expect } from 'chai';
import DarkSky, { Forecast } from 'dark-sky';
import mockdate from 'mockdate';
import moment from 'moment';
import 'moment-timezone';
import { Mock } from './util/mock';
import { mockDarkSky } from './util/mock-dark-sky';

import { LocationResolver } from '../src/location';
import { parseTime } from '../src/time';
import { WeatherForecast } from '../src/weather-forecast';
import { DEFAULT_DATE, DEFAULT_TIME, FORECAST, FORECAST_DATE } from './util/mock-forecast';

const LOCATION1 = {
  coordinates: [1, 2],
  timezone: FORECAST.timezone,
};

describe('Weather Forecast', () => {

  let locationResolverBoston: LocationResolver;
  let locationResolverEmpty: LocationResolver;
  let forecast: Forecast;
  let darkSky: DarkSky;

  beforeEach(() => {
    mockdate.set(FORECAST_DATE);
    locationResolverBoston = new Mock<LocationResolver>()
      .onPromised('resolve', LOCATION1)
      .mock();
    locationResolverEmpty = new Mock<LocationResolver>()
      .onPromised('resolve', null)
      .mock();
    const ds = mockDarkSky();
    forecast = ds.forecast;
    darkSky = ds.darkSky;
  });

  describe('For Date', () => {
    const type = 'date';
    const value = DEFAULT_DATE;

    it('returns forecast for day', async () => {
      const weather = new WeatherForecast(locationResolverBoston, darkSky);
      const resp = await weather.lookup('Boston', { type, value });
      const time = moment.tz(value, LOCATION1.timezone).unix();
      const day = forecast.daily.data.find((x) => x.time === time);
      expect(resp.location.coordinates).to.equal(LOCATION1.coordinates);
      expect(resp.day.time).to.equal(time);
      expect(resp.day.temperatureHigh).to.equal(day.temperatureHigh);
    });

    it('ignores date out of range', async () => {
      const weather = new WeatherForecast(locationResolverBoston, darkSky);
      const value = '2000-01-01';
      const resp = await weather.lookup('Boston', { type, value });
      expect(resp).to.be.undefined;
    });

    it('ignores null location', async () => {
      const weather = new WeatherForecast(locationResolverEmpty, darkSky);
      const resp = await weather.lookup('nowhere', { type, value });
      expect(resp).to.be.undefined;
    });
  });

  describe('For Time', () => {
    const type = 'time';
    const value = DEFAULT_TIME;

    it('returns forecast', async () => {
      const weather = new WeatherForecast(locationResolverBoston, darkSky);
      const resp = await weather.lookup('Boston', { type, value });
      const time = moment(parseTime(value, LOCATION1.timezone))
        .tz(LOCATION1.timezone)
        .startOf('hour')
        .unix();
      const hour = forecast.hourly.data.find((x) => x.time === time);
      expect(resp.location.coordinates).to.equal(LOCATION1.coordinates);
      expect(resp.hour.time).to.equal(time);
      expect(resp.hour.temperature).to.equal(hour.temperature);
    });

    it('ignores time out of range', async () => {
      mockdate.set(new Date('2000-01-01'));
      const { darkSky } = mockDarkSky();
      const weather = new WeatherForecast(locationResolverBoston, darkSky);
      const resp = await weather.lookup('Boston', { type, value });
      expect(resp).to.be.undefined;
    });

    it('ignores null location', async () => {
      const weather = new WeatherForecast(locationResolverEmpty, darkSky);
      const resp = await weather.lookup('nowhere', { type, value });
      expect(resp).to.be.undefined;
    });
  });

  describe('Date Range', () => {
    const type = 'daterange';
    const start = DEFAULT_DATE;
    const end = moment.utc(FORECAST_DATE).add(2, 'days').format('YYYY-MM-DD');

    it('returns forecast', async () => {
      const weather = new WeatherForecast(locationResolverBoston, darkSky);
      const resp = await weather.lookup('BOSTON', { type, start, end });
      const expectStart = moment.tz(start, LOCATION1.timezone).unix();
      const expectEnd = moment.tz(end, LOCATION1.timezone).subtract(1, 'day').unix();
      expect(resp.location.coordinates).to.equal(LOCATION1.coordinates);
      expect(resp.daily.length).to.equal(2);
      expect(resp.daily[0].time).to.equal(expectStart);
      expect(resp.daily[resp.daily.length - 1].time).to.equal(expectEnd);
      console.log(resp.summary);
    });

    it('ignores null location', async () => {
      const weather = new WeatherForecast(locationResolverEmpty, darkSky);
      const resp = await weather.lookup('nowhere', { type, start, end });
      expect(resp).to.be.undefined;
    });
  });

  describe('Time Range', () => {
    const type = 'timerange';
    const start = '12:00:00';
    const end = '15:00:00';

    it('returns forecast', async () => {
      const weather = new WeatherForecast(locationResolverBoston, darkSky);
      const resp = await weather.lookup('BOSTON', { type, start, end });
      const expectStart = parseTime(start, LOCATION1.timezone).getTime() / 1000;
      const expectEnd = moment.tz(parseTime(end, LOCATION1.timezone), LOCATION1.timezone).subtract(1, 'hour').unix();

      expect(resp.location.coordinates).to.equal(LOCATION1.coordinates);
      expect(resp.hourly.length).to.equal(3);
      expect(resp.hourly[0].time).to.equal(expectStart);
      expect(resp.hourly[resp.hourly.length - 1].time).to.equal(expectEnd);
    });

    it('ignores null location', async () => {
      const weather = new WeatherForecast(locationResolverEmpty, darkSky);
      const resp = await weather.lookup('nowhere', { type, start, end });
      expect(resp).to.be.undefined;
    });
  });
});
