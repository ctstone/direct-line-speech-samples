import * as DarkSky from 'dark-sky';

import { createDate } from './time';
import { WeatherForecast } from './weather-forecast';
import { DarkSkyFeature, getUnits } from './weather-units';

export type WeatherFeature
  = 'temperatureHigh'
  | 'temperatureLow'
  | 'temperature'
  | 'apparentTemperatureHigh'
  | 'apparentTemperatureLow'
  | 'precipIntensity'
  | 'precipAccumulation'
  | 'precipProbability'
  | 'cloudCover'
  | 'pressure'
  | 'windSpeed'
  | 'humidity';

export interface WeatherCondition extends WeatherValue {
  atDate?: Date;
  precipType?: string;
  wind?: WindCondition;
}

export interface WindCondition {
  speed: WeatherValue;
  gust: WeatherValue;
  bearing: WeatherValue;
  gustTime?: Date;
}

export interface WeatherValue {
  feature: DarkSkyFeature;
  value: number;
  units: string;
}

export class WeatherConditions {
  constructor(private forecast: WeatherForecast) { }

  async forDate(place: string, date: Date, feature: WeatherFeature, unitsType: DarkSky.Units): Promise<WeatherCondition> {
    const forecast = await this.forecast.forDate(place, date);
    const units = getUnits(feature as DarkSkyFeature, unitsType);
    const { day } = forecast;

    let value: number;
    let atDate: Date;
    let precipType: string;
    let wind: WindCondition;
    switch (feature) {
      case 'temperatureHigh':
        value = day.temperatureHigh;
        atDate = createDate(day.temperatureHighTime);
        break;

      case 'temperatureLow':
        value = day.temperatureLow;
        atDate = createDate(day.temperatureLowTime);
        break;

      case 'temperature':
        value = (day.temperatureHigh + day.temperatureLow) / 2;
        break;

      case 'apparentTemperatureHigh':
        value = day.apparentTemperatureHigh;
        atDate = createDate(day.apparentTemperatureHighTime);
        break;

      case 'apparentTemperatureLow':
        value = day.apparentTemperatureLow;
        atDate = createDate(day.apparentTemperatureLowTime);
        break;

      case 'precipIntensity':
        value = day.precipIntensity;
        precipType = day.precipType;
        break;

      case 'precipAccumulation':
        value = day.precipAccumulation;
        precipType = day.precipType;
        break;

      case 'precipProbability':
        value = day.precipProbability;
        precipType = day.precipType;
        break;

      case 'cloudCover':
        value = day.cloudCover;
        break;

      case 'pressure':
        value = day.pressure;
        break;

      case 'windSpeed':
        value = day.windSpeed;
        wind = getWindConditionForDay(day, unitsType);

      case 'humidity':
        value = day.humidity;
        break;
    }

    return { feature, value, units, atDate, precipType, wind };
  }
}

function getWindConditionForDay(day: DarkSky.DataPointDaily, unitsType: DarkSky.Units) {
  const wind = getWindCondition(day, unitsType);
  wind.gustTime = createDate(day.windGustTime);
  return wind;
}

function getWindCondition(dataPoint: DarkSky.DataPoint, unitsType: DarkSky.Units): WindCondition {
  const { windSpeed, windBearing, windGust } = dataPoint;
  const speed: WeatherValue = {
    feature: 'windSpeed',
    value: windSpeed,
    units: getUnits('windSpeed', unitsType),
  };
  const bearing: WeatherValue = {
    feature: 'windBearing',
    value: windBearing,
    units: getUnits('windBearing', unitsType),
  };
  const gust: WeatherValue = {
    feature: 'windGust',
    value: windGust,
    units: getUnits('windGust', unitsType),
  };

  return { speed, bearing, gust };
}
