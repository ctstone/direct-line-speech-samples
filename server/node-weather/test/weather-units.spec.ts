import { expect } from 'chai';

import { DarkSkyFeature, getUnits, getUnitsFor } from '../src/weather-units';

const TEMPERATURE_PROPS: DarkSkyFeature[] = [
  'temperature',
  'temperatureMin',
  'temperatureMax',
  'temperatureLow',
  'temperatureHigh',
  'apparentTemperature',
  'dewPoint'];

const DISTANCE_PROPS: DarkSkyFeature[] = [
  'nearestStormDistance',
  'visibility',
];

const PRECIP_INTENSITY_PROPS: DarkSkyFeature[] = [
  'precipIntensity',
  'precipIntensityMax',
];

const PRECIP_PROPS: DarkSkyFeature[] = [
  'precipAccumulation',
];

const SPEED_PROPS: DarkSkyFeature[] = [
  'windSpeed',
  'windGust',
];

const BEARING_PROPS: DarkSkyFeature[] = [
  'windBearing',
];

const PRESSURE_PROPS: DarkSkyFeature[] = [
  'pressure',
];

const PERCENT_PROPS: DarkSkyFeature[] = [
  'cloudCover',
  'precipProbability',
];

describe('Weather Units', () => {
  it('handles unmatched properties', () => {
    expect(getUnits('xxx' as any, 'us')).to.equal('');
  });

  it('has a UnitsType factory', () => {
    const getUnits = getUnitsFor('us');
    expect(getUnits('temperature')).to.equal('degrees Fahrenheit');
  });

  describe('Temperature', () => {
    it('handles US units', () => {
      TEMPERATURE_PROPS.forEach((prop) => {
        expect(getUnits(prop, 'us')).to.equal('degrees Fahrenheit');
      });
    });

    it('handles SI units', () => {
      TEMPERATURE_PROPS.forEach((prop) => {
        expect(getUnits(prop, 'si')).to.equal('degrees Celsius');
      });
    });
  });

  describe('Distance', () => {
    it('handles US/UK units', () => {
      DISTANCE_PROPS.forEach((prop) => {
        expect(getUnits(prop, 'us')).to.equal('miles');
        expect(getUnits(prop, 'uk2')).to.equal('miles');
      });
    });

    it('handles SI units', () => {
      DISTANCE_PROPS.forEach((prop) => {
        expect(getUnits(prop, 'si')).to.equal('kilometers');
      });
    });
  });

  describe('Precip Intensity', () => {
    it('handles US units', () => {
      PRECIP_INTENSITY_PROPS.forEach((prop) => {
        expect(getUnits(prop, 'us')).to.equal('inches per hour');
      });
    });

    it('handles SI units', () => {
      PRECIP_INTENSITY_PROPS.forEach((prop) => {
        expect(getUnits(prop, 'si')).to.equal('millimeters per hour');
      });
    });
  });

  describe('Precip Accumulation', () => {
    it('handles US units', () => {
      PRECIP_PROPS.forEach((prop) => {
        expect(getUnits(prop, 'us')).to.equal('inches');
      });
    });

    it('handles SI units', () => {
      PRECIP_PROPS.forEach((prop) => {
        expect(getUnits(prop, 'si')).to.equal('centimeters');
      });
    });
  });

  describe('Speed', () => {
    it('handles US units', () => {
      SPEED_PROPS.forEach((prop) => {
        expect(getUnits(prop, 'us')).to.equal('miles per hour');
        expect(getUnits(prop, 'uk2')).to.equal('miles per hour');
      });
    });

    it('handles CA units', () => {
      SPEED_PROPS.forEach((prop) => {
        expect(getUnits(prop, 'ca')).to.equal('kilometers per hour');
      });
    });

    it('handles SI units', () => {
      SPEED_PROPS.forEach((prop) => {
        expect(getUnits(prop, 'si')).to.equal('meters per second');
      });
    });
  });

  describe('Bearing', () => {
    it('handles units', () => {
      BEARING_PROPS.forEach((prop) => {
        expect(getUnits(prop, 'us')).to.equal('degrees');
      });
    });
  });

  describe('Pressure', () => {
    it('handles US units', () => {
      PRESSURE_PROPS.forEach((prop) => {
        expect(getUnits(prop, 'us')).to.equal('millibars');
      });
    });

    it('handles SI units', () => {
      PRESSURE_PROPS.forEach((prop) => {
        expect(getUnits(prop, 'si')).to.equal('hectopascals');
      });
    });
  });

  describe('Percentage', () => {
    it('handles US units', () => {
      PERCENT_PROPS.forEach((prop) => {
        expect(getUnits(prop, 'us')).to.equal('%');
      });
    });
  });
});
