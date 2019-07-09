import { expect, use } from 'chai';
import chaiBigNumber from 'chai-bignumber';
import chaiString from 'chai-string';
import mockdate from 'mockdate';
import 'moment-timezone';
import { Mock } from './util/mock';
import { mockDarkSky } from './util/mock-dark-sky';
import { DEFAULT_DATE, FORECAST, FORECAST_DATE } from './util/mock-forecast';

import { LocationResolver } from '../src/location';
import { WeatherFeature, WeatherForecastConditions } from '../src/weather-conditions';
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
    const precision = 0;

    describe('Temperature', () => {
      const tests = [
        ['temperature', 79],
        ['temperatureHigh', 89],
        ['temperatureLow', 69],
        ['apparentTemperature', 79],
        ['apparentTemperatureHigh', 89],
        ['apparentTemperatureLow', 69],
      ] as Array<[WeatherFeature, number]>;

      for (const [feature, expected] of tests) {
        it(`gives ${feature}`, async () => {
          const resp = await conditions.lookup('Boston', { type, value }, feature);
          expect(resp.value.value).to.bignumber.equal(expected, precision);
          expect(resp.value.units).to.equalIgnoreCase('degrees fahrenheit');
        });
      }
    });

    describe('Precipitation', () => {
      const tests = [
        'precipIntensity',
        'precipAccumulation',
        'precipProbability'] as WeatherFeature[];

      for (const feature of tests) {
        it(`gives ${feature}`, async () => {
          const resp = await conditions.lookup('Boston', { type, value }, feature);
          expect(resp.value.precip.type).to.equal('rain');
          expect(resp.value.precip.intensity.value).to.equal(0.0003);
          expect(resp.value.precip.intensity.units).to.equal('inches per hour');
          expect(resp.value.precip.accumulation.value).to.be.undefined;
          expect(resp.value.precip.accumulation.units).to.equal('inches');
          expect(resp.value.precip.probability.value).to.equal(0.03);
          expect(resp.value.precip.probability.units).to.equal('%');
        });
      }
    });

    describe('Cloud Cover', () => {
      it('gives conditions', async () => {
        const resp = await conditions.lookup('Boston', { type, value }, 'cloudCover');
        expect(resp.value.value).to.equal(0.39);
        expect(resp.value.units).to.equal('%');
      });
    });
  });
});
