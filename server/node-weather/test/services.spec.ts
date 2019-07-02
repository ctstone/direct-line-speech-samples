import { expect } from 'chai';

import './util/set-env';

import * as services from '../src/services';

describe('Services', () => {

  describe('Azure Map', () => {
    it('is created', () => {
      expect(services.createAzureMap()).to.be.an('object');
    });
  });

  describe('Dark Sky', () => {
    it('is created', () => {
      expect(services.createDarkSky()).to.be.an('object');
    });
  });

  describe('Storage', () => {
    it('is created', () => {
      expect(services.createStorage()).to.be.an('object');
    });
  });

  describe('Location Resolver', () => {
    it('is created', () => {
      expect(services.createLocationResolver()).to.be.an('object');
    });
  });

  describe('Weather Forecast', () => {
    it('is created', () => {
      expect(services.createWeatherForecast()).to.be.an('object');
    });
  });

  describe('Recognizer', () => {
    it('is created', () => {
      expect(services.createWeatherRecognizer()).to.be.an('object');
    });
  });
});
