import { expect, use } from 'chai';
import chaiBigNumber from 'chai-bignumber';
import chaiString from 'chai-string';
import mockdate from 'mockdate';
import 'moment-timezone';
import { Mock } from './util/mock';
import { mockDarkSky } from './util/mock-dark-sky';
import { DEFAULT_DATE, FORECAST, FORECAST_DATE } from './util/mock-forecast';

import { LocationResolver } from '../src/location';
import { WeatherForecastConditions } from '../src/weather-conditions';
import { WeatherForecast } from '../src/weather-forecast';

use(chaiBigNumber());
use(chaiString);

const LOCATION1 = {
  coordinates: [1, 2],
  timezone: FORECAST.timezone,
};

describe('Weather Conditions', () => {
  let conditions: WeatherForecastConditions;

  beforeEach(() => {
    mockdate.set(FORECAST_DATE);
    const locationResolverBoston = new Mock<LocationResolver>()
      .onPromised('resolve', LOCATION1)
      .mock();
    const darkSky = mockDarkSky(FORECAST);
    const weather = new WeatherForecast(locationResolverBoston, darkSky);
    conditions = new WeatherForecastConditions(weather);
  });

  describe('For Date', () => {
    const type = 'date';
    const value = DEFAULT_DATE;

    it('gives temperature', async () => {
      const resp = await conditions.lookup('Boston', { type, value }, 'temperature');
      expect(Math.round(resp.value.value)).to.equal(79);
      expect(resp.value.units).to.equalIgnoreCase('degrees fahrenheit');
    });

    it.only('xxx', async () => {
      const resp = await conditions.lookup('Boston', { type, value }, 'temperatureHigh');
      expect(resp.value.value).to.bignumber.equal(89, 0);
      expect(resp.value.units).to.equalIgnoreCase('degrees fahrenheit');
    });
  });
});
