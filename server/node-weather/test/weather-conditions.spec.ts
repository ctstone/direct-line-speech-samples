import { expect, use } from 'chai';
import chaiBigNumber from 'chai-bignumber';
import chaiString from 'chai-string';
import mockdate from 'mockdate';
import moment from 'moment';

import { Mock } from './util/mock';
import { mockDarkSky } from './util/mock-dark-sky';
import { DEFAULT_DATE, DEFAULT_HOUR, DEFAULT_TIME, FORECAST, FORECAST_DATE } from './util/mock-forecast';

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

    describe('Pressure', () => {
      it('gives conditions', async () => {
        const resp = await conditions.lookup('Boston', { type, value }, 'pressure');
        expect(resp.value.value).to.equal(1017.67);
        expect(resp.value.units).to.equal('millibars');
      });
    });

    describe('Wind', () => {
      it('gives conditions', async () => {
        const resp = await conditions.lookup('Boston', { type, value }, 'windSpeed');
        expect(resp.value.value).to.equal(4.6);
        expect(resp.value.units).to.equal('miles per hour');
        expect(resp.value.value).to.be.equal(resp.value.wind.speed.value);
        expect(resp.value.units).to.be.equal(resp.value.wind.speed.units);
        expect(resp.value.wind.bearing.value).to.equal(148);
        expect(resp.value.wind.bearing.units).to.equal('degrees');
        expect(resp.value.wind.gust.value).to.equal(10.99);
        expect(resp.value.wind.gust.units).to.equal('miles per hour');
        expect(resp.value.wind.gustTime).to.be.a('Date');
      });
    });

    describe('Humidity', () => {
      it('gives conditions', async () => {
        const resp = await conditions.lookup('Boston', { type, value }, 'humidity');
        expect(resp.value.value).to.equal(0.58);
        expect(resp.value.units).to.equal('%');
      });
    });

    describe('Ozone', () => {
      it('gives conditions', async () => {
        const resp = await conditions.lookup('Boston', { type, value }, 'ozone');
        expect(resp.value.value).to.equal(315.9);
        expect(resp.value.units).to.equal('Dobson units');
      });
    });
  });

  describe('For Time', () => {
    const type = 'time';
    const value = DEFAULT_TIME;

    describe('Temperature', () => {
      const tests = [
        ['temperature', 75.05],
        ['temperatureHigh', 75.05],
        ['temperatureLow', 75.05],
        ['apparentTemperature', 75.47],
        ['apparentTemperatureHigh', 75.47],
        ['apparentTemperatureLow', 75.47],
      ] as Array<[WeatherFeature, number]>;

      for (const [feature, expected] of tests) {
        it(`gives ${feature}`, async () => {
          const resp = await conditions.lookup('Boston', { type, value }, feature);
          expect(resp.value.value).to.equal(expected);
          expect(resp.value.units).to.equal('degrees Fahrenheit');
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
          expect(resp.value.precip.intensity.value).to.equal(0.001);
          expect(resp.value.precip.intensity.units).to.equal('inches per hour');
          expect(resp.value.precip.accumulation.value).to.be.undefined;
          expect(resp.value.precip.accumulation.units).to.equal('inches');
          expect(resp.value.precip.probability.value).to.equal(0.01);
          expect(resp.value.precip.probability.units).to.equal('%');
        });
      }
    });

    describe('Cloud Cover', () => {
      it('gives conditions', async () => {
        const resp = await conditions.lookup('Boston', { type, value }, 'cloudCover');
        expect(resp.value.value).to.be.equal(0);
        expect(resp.value.units).to.equal('%');
      });
    });

    describe('Pressure', () => {
      it('gives conditions', async () => {
        const resp = await conditions.lookup('Boston', { type, value }, 'pressure');
        expect(resp.value.value).to.equal(1017.86);
        expect(resp.value.units).to.equal('millibars');
      });
    });

    describe('Wind', () => {
      it('gives conditions', async () => {
        const resp = await conditions.lookup('Boston', { type, value }, 'windSpeed');
        expect(resp.value.value).to.equal(2.26);
        expect(resp.value.units).to.equal('miles per hour');
        expect(resp.value.value).to.be.equal(resp.value.wind.speed.value);
        expect(resp.value.units).to.be.equal(resp.value.wind.speed.units);
        expect(resp.value.wind.bearing.value).to.equal(10);
        expect(resp.value.wind.bearing.units).to.equal('degrees');
        expect(resp.value.wind.gust.value).to.equal(2.26);
        expect(resp.value.wind.gust.units).to.equal('miles per hour');
        expect(resp.value.wind.gustTime).to.be.undefined;
      });
    });

    describe('Humidity', () => {
      it('gives conditions', async () => {
        const resp = await conditions.lookup('Boston', { type, value }, 'humidity');
        expect(resp.value.value).to.equal(0.68);
        expect(resp.value.units).to.equal('%');
      });
    });

    describe('Ozone', () => {
      it('gives conditions', async () => {
        const resp = await conditions.lookup('Boston', { type, value }, 'ozone');
        expect(resp.value.value).to.equal(317.3);
        expect(resp.value.units).to.equal('Dobson units');
      });
    });
  });

  describe('For Date Range', () => {
    const type = 'daterange';
    const start = DEFAULT_DATE;
    const numDays = 2;
    const end = moment.utc(FORECAST_DATE)
      .startOf('day')
      .add(numDays, 'days')
      .format('YYYY-MM-DD');

    const precipFeatures = [
      'precipIntensity',
      'precipAccumulation',
      'precipProbability',
    ] as WeatherFeature[];

    const features = [
      'temperature',
      'apparentTemperature',
      'cloudCover',
      'pressure',
      'humidity',
      'ozone',
    ] as WeatherFeature[];

    const aggregateFeatures = [
      'temperatureHigh',
      'temperatureLow',
      'apparentTemperatureHigh',
      'apparentTemperatureLow',
    ] as WeatherFeature[];

    for (const feature of features) {
      it(`gives ${feature}`, async () => {
        const resp = await conditions.lookup('Boston', { type, start, end }, feature);
        expect(resp.range.dates.length).to.equal(numDays);
        expect(resp.range.values.length).to.equal(numDays);
        expect(resp.range.precips.length).to.equal(0);
        expect(resp.range.wind.length).to.equal(0);
      });
    }

    describe('Precipitation', () => {
      for (const feature of precipFeatures) {
        it(`gives ${feature}`, async () => {
          const resp = await conditions.lookup('Boston', { type, start, end }, feature);
          expect(resp.range.dates.length).to.equal(numDays);
          expect(resp.range.values.length).to.equal(numDays);
          expect(resp.range.precips.length).to.equal(numDays);
          expect(resp.range.wind.length).to.equal(0);
        });
      }
    });

    describe('Wind', () => {
      const feature = 'windSpeed';
      it('gives conditions', async () => {
        const resp = await conditions.lookup('Boston', { type, start, end }, feature);
        expect(resp.range.dates.length).to.equal(numDays);
        expect(resp.range.values.length).to.equal(numDays);
        expect(resp.range.precips.length).to.equal(0);
        expect(resp.range.wind.length).to.equal(numDays);
      });
    });

    describe('Aggregates', () => {
      for (const feature of aggregateFeatures) {
        it(`gives ${feature}`, async () => {
          const resp = await conditions.lookup('Boston', { type, start, end }, feature);
          expect(resp.range.dates.length).to.equal(1);
          expect(resp.range.values.length).to.equal(1);
          expect(resp.range.precips.length).to.equal(0);
          expect(resp.range.wind.length).to.equal(0);
        });
      }
    });
  });

  describe('For Time Range', () => {
    const type = 'timerange';
    const start = DEFAULT_HOUR;
    const numHours = 4;
    const end = moment.utc(FORECAST_DATE)
      .startOf('hour')
      .add(numHours, 'hours')
      .tz(LOCATION1.timezone)
      .format('HH:mm:ss');

    const precipFeatures = [
      'precipIntensity',
      'precipAccumulation',
      'precipProbability',
    ] as WeatherFeature[];

    const features = [
      'temperature',
      'apparentTemperature',
      'cloudCover',
      'pressure',
      'humidity',
      'ozone',
    ] as WeatherFeature[];

    const aggregateFeatures = [
      'temperatureHigh',
      'temperatureLow',
      'apparentTemperatureHigh',
      'apparentTemperatureLow',
    ] as WeatherFeature[];

    for (const feature of features) {
      it(`gives ${feature}`, async () => {
        const resp = await conditions.lookup('Boston', { type, start, end }, feature);
        expect(resp.range.dates.length).to.equal(numHours);
        expect(resp.range.values.length).to.equal(numHours);
        expect(resp.range.precips.length).to.equal(0);
        expect(resp.range.wind.length).to.equal(0);
      });
    }

    describe('Precipitation', () => {
      for (const feature of precipFeatures) {
        it(`gives ${feature}`, async () => {
          const resp = await conditions.lookup('Boston', { type, start, end }, feature);
          expect(resp.range.dates.length).to.equal(numHours);
          expect(resp.range.values.length).to.equal(numHours);
          expect(resp.range.precips.length).to.equal(numHours);
          expect(resp.range.wind.length).to.equal(0);
        });
      }
    });

    describe('Wind', () => {
      const feature = 'windSpeed';
      it('gives conditions', async () => {
        const resp = await conditions.lookup('Boston', { type, start, end }, feature);
        expect(resp.range.dates.length).to.equal(numHours);
        expect(resp.range.values.length).to.equal(numHours);
        expect(resp.range.precips.length).to.equal(0);
        expect(resp.range.wind.length).to.equal(numHours);
      });
    });

    describe('Aggregates', () => {
      for (const feature of aggregateFeatures) {
        it(`gives ${feature}`, async () => {
          const resp = await conditions.lookup('Boston', { type, start, end }, feature);
          expect(resp.range.dates.length).to.equal(1);
          expect(resp.range.values.length).to.equal(1);
          expect(resp.range.precips.length).to.equal(0);
          expect(resp.range.wind.length).to.equal(0);
        });
      }
    });
  });
});
