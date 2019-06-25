import { MemoryStorage } from 'botbuilder';
import { LuisRecognizer } from 'botbuilder-ai';
import DarkSky from 'dark-sky';

import { AzureMap } from './azure-map';

import { LocationResolver } from './location';
import {
  DARK_SKY_SETTINGS,
  LUIS_SETTINGS,
  MAP_SETTINGS,
} from './settings';
import { WeatherForecast } from './weather-forecast';

export function createStorage() {
  return new MemoryStorage();
}

export function createWeatherRecognizer() {
  const { key, region, apps: { weatherAppId } } = LUIS_SETTINGS;
  return new LuisRecognizer({
    applicationId: weatherAppId,
    endpointKey: key,
    endpoint: `https://${region}.api.cognitive.microsoft.com`,
  });
}

export function createAzureMap() {
  const { key } = MAP_SETTINGS;
  return new AzureMap(key);
}

export function createDarkSky() {
  const { key } = DARK_SKY_SETTINGS;
  return new DarkSky(key);
}

export function createLocationResolver() {
  const map = createAzureMap();
  return new LocationResolver(map);
}

export function createWeatherForecast() {
  const locationResolver = createLocationResolver();
  const darkSky = createDarkSky();
  return new WeatherForecast(locationResolver, darkSky);
}
