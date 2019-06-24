import { recognizeDateTime } from '@microsoft/recognizers-text-date-time';
import { RecognizerResult } from 'botbuilder';

import { WeatherCondition, WeatherEntity, WeatherGear, WeatherPrecipitation } from './luis-model';
import { RelativeDateTime } from './time';
import { WeatherFeature } from './weather-conditions';

export type WeatherFeatureEntity = WeatherCondition | WeatherPrecipitation | WeatherGear;

export interface WeatherRequest {
  place?: string;
  date?: string;
  dateTime?: RelativeDateTime;
}

export interface WeatherConditionsRequest extends WeatherRequest {
  requestedFeature?: WeatherFeatureEntity;
  feature?: WeatherFeature;
}

const ENTITY_TO_FEATURE = new Map<WeatherFeatureEntity, WeatherFeature>([
  [WeatherCondition.heat, 'temperatureHigh'],
  [WeatherCondition.cold, 'temperatureLow'],
  [WeatherCondition.humidity, 'humidity'],
  [WeatherCondition.sun, 'temperatureHigh'],
  [WeatherCondition.cloudCoverage, 'cloudCover'],
  [WeatherCondition.windGust, 'windSpeed'],
  [WeatherCondition.fog, 'precipProbability'],
  [WeatherCondition.temperature, 'temperature'],
  [WeatherCondition.high, 'temperatureHigh'],
  [WeatherCondition.low, 'temperatureLow'],
  [WeatherCondition.ozone, 'temperatureHigh'],
  [WeatherPrecipitation.any, 'precipAccumulation'],
  [WeatherPrecipitation.rain, 'precipAccumulation'],
  [WeatherPrecipitation.snow, 'precipAccumulation'],
  [WeatherPrecipitation.sleet, 'precipAccumulation'],
]);

const FEATURE_LABELS = new Map<WeatherFeature, string>([
  ['temperatureHigh', 'high temperature'],
  ['temperatureLow', 'low temperature'],
  ['temperature', 'temperature'],
  ['cloudCover', 'cloudCoverage'],
  ['pressure', 'pressure'],
  ['humidity', 'humidity'],
  ['ozone', 'ozone index'],
]);

export function getWeatherFeatureEntity(recognized: RecognizerResult): WeatherFeatureEntity {
  const { entities } = recognized;

  const entityType = [
    WeatherEntity.precipitation,
    WeatherEntity.condition,
    WeatherEntity.gear,
  ].find((x) => entities[x]);

  return entityType ? entities[entityType][0][0] : null;
}

export function getPlaceEntity(recognized: RecognizerResult): string {
  const { entities } = recognized;

  const entityType = [
    WeatherEntity.location,
    WeatherEntity.city,
    WeatherEntity.poi,
    WeatherEntity.state,
    WeatherEntity.countryRegion,
  ].find((x) => entities[x]);

  return entityType ? entities[entityType][0] : 'Boston'; // TODO remove default
}

export function getDateEntityText(recognized: RecognizerResult) {
  let text = 'today';
  if (recognized.entities.$instance[WeatherEntity.datetime]) {
    [{ text }] = recognized.entities.$instance[WeatherEntity.datetime];
  }
  return text;
}

export function getRelativeDateEntity(dateText: string, culture: string): RelativeDateTime {
  const [dateTime] = recognizeDateTime(dateText, culture);
  const [past, future] = dateTime.resolution.values as [RelativeDateTime, RelativeDateTime];
  return future || past;
}

export function createWeatherRequest(recognized: RecognizerResult, culture: string): WeatherRequest {
  const place = getPlaceEntity(recognized);
  const date = getDateEntityText(recognized);
  const dateTime = getRelativeDateEntity(date, culture);
  return { place, date, dateTime };
}

export function createConditionsRequest(recognized: RecognizerResult, culture: string): WeatherConditionsRequest {
  const { place, date, dateTime } = createWeatherRequest(recognized, culture);
  const requestedFeature = getWeatherFeatureEntity(recognized);
  const feature = getFeatureFromEntity(requestedFeature);
  return { place, date, dateTime, requestedFeature, feature };
}

export function getFeatureFromEntity(entity: WeatherFeatureEntity): WeatherFeature {
  return ENTITY_TO_FEATURE.get(entity);
}

export function getFeatureLabel(feature: WeatherFeature): string {
  return FEATURE_LABELS.get(feature); // TODO i18n
}
