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

const LOCATION1 = {
  coordinates: [1, 2],
  timezone: 'America/New_York',
};
const DEFAULT_DATE = '2000-01-01';
const DEFAULT_TIME = '12:01:02';

describe('Weather Forecast', () => {

  let locationResolverBoston: LocationResolver;
  let forecast: Forecast;
  let darkSky: DarkSky;

  beforeEach(() => {
    mockdate.set(`${DEFAULT_DATE}T${DEFAULT_TIME}`);
    locationResolverBoston = new Mock<LocationResolver>()
      .onPromised('resolve', LOCATION1)
      .mock();
    const ds = mockDarkSky(DEFAULT_DATE);
    forecast = ds.forecast;
    darkSky = ds.darkSky;
  });

  it('ignores null location', async () => {
    const locationResolverEmpty = new Mock<LocationResolver>()
      .onPromised('resolve', null)
      .mock();
    const weather = new WeatherForecast(locationResolverEmpty, darkSky);
    const type = 'date';
    const value = DEFAULT_DATE;
    const resp = await weather.lookup('nowhere', { type, value });
    expect(resp).to.be.undefined;
  });

  describe('For Date', () => {
    it('returns forecast for day', async () => {
      const weather = new WeatherForecast(locationResolverBoston, darkSky);
      const type = 'date';
      const value = DEFAULT_DATE;
      const resp = await weather.lookup('Boston', { type, value });

      const time = moment.tz(value, LOCATION1.timezone).unix();
      const day = forecast.daily.data.find((x) => x.time === time);
      expect(resp.location.coordinates).to.equal(LOCATION1.coordinates);
      expect(resp.day.time).to.equal(time);
      expect(resp.day.temperatureHigh).to.equal(day.temperatureHigh);
    });

    it('ignores date out of range', async () => {
      const weather = new WeatherForecast(locationResolverBoston, darkSky);
      const type = 'date';
      const value = '2002-01-01';
      const resp = await weather.lookup('Boston', { type, value });
      expect(resp).to.be.undefined;
    });
  });

  describe('For Time', () => {
    it('returns forecast for time', async () => {
      const weather = new WeatherForecast(locationResolverBoston, darkSky);
      const type = 'time';
      const value = '08:00:00';
      const resp = await weather.lookup('Boston', { type, value });

      const time = parseTime(value, LOCATION1.timezone).getTime() / 1000;
      const hour = forecast.hourly.data.find((x) => x.time === time);
      expect(resp.location.coordinates).to.equal(LOCATION1.coordinates);
      expect(resp.hour.time).to.equal(time);
      expect(resp.hour.temperature).to.equal(hour.temperature);
    });

    it('ignores time out of range', async () => {
      const { darkSky } = mockDarkSky('2001-01-01');
      const weather = new WeatherForecast(locationResolverBoston, darkSky);
      const type = 'time';
      const value = '08:00:00';
      const resp = await weather.lookup('Boston', { type, value });
      expect(resp).to.be.undefined;
    });
  });

  describe('Date Range', () => {
    it('returns forecast', async () => {
      const weather = new WeatherForecast(locationResolverBoston, darkSky);
      const type = 'daterange';
      const start = DEFAULT_DATE;
      const end = '2000-01-03';
      const resp = await weather.lookup('BOSTON', { type, start, end });

      const expectStart = moment.tz(start, LOCATION1.timezone).unix();
      const expectEnd = moment.tz(end, LOCATION1.timezone).subtract(1, 'day').unix();
      expect(resp.location.coordinates).to.equal(LOCATION1.coordinates);
      expect(resp.daily.length).to.equal(2);
      expect(resp.daily[0].time).to.equal(expectStart);
      expect(resp.daily[resp.daily.length - 1].time).to.equal(expectEnd);
    });
  });

  describe('Time Range', () => {
    it('returns forecast', async () => {
      const weather = new WeatherForecast(locationResolverBoston, darkSky);
      const type = 'timerange';
      const start = '12:00:00';
      const end = '15:00:00';
      const resp = await weather.lookup('BOSTON', { type, start, end });

      const expectStart = parseTime(start, LOCATION1.timezone).getTime() / 1000;
      const expectEnd = moment.tz(parseTime(end, LOCATION1.timezone), LOCATION1.timezone).subtract(1, 'hour').unix();

      expect(resp.location.coordinates).to.equal(LOCATION1.coordinates);
      expect(resp.hourly.length).to.equal(3);
      expect(resp.hourly[0].time).to.equal(expectStart);
      expect(resp.hourly[resp.hourly.length - 1].time).to.equal(expectEnd);
    });
  });
});
