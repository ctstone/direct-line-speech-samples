import * as DarkSky from 'dark-sky';

import { createDate, RelativeDateTime } from './time';
import { WeatherForecast } from './weather-forecast';
import { DarkSkyFeature, getUnits } from './weather-units';

export type WeatherFeature
  = 'temperatureHigh'
  | 'temperatureLow'
  | 'temperature'
  | 'apparentTemperatureHigh'
  | 'apparentTemperatureLow'
  | 'apparentTemperature'
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

export interface WeatherConditionRange {
  dates: Date[];
  values: WeatherValue[];
  precipTypes?: string[];
  wind?: WindCondition[];
}

export interface WindCondition {
  speed: WeatherValue;
  gust: WeatherValue;
  bearing: WeatherValue;
  gustTime?: Date;
}

export interface WeatherValue {
  value: number;
  units: string;
}

export interface DateRange {
  start: Date;
  end: Date;
}

export class WeatherConditions {
  constructor(private forecast: WeatherForecast) { }

  lookup(place: string, relativeDate: RelativeDateTime, feature: WeatherFeature, unitsType: DarkSky.Units) {
    switch (relativeDate.type) {
      case 'date':
      case 'datetime':
        return this.forDate(place, relativeDate, feature, unitsType);

      case 'time':
        return this.forTime(place, relativeDate, feature, unitsType);

      case 'daterange':
      case 'datetimerange':
        return this.forDateRange(place, relativeDate, feature, unitsType);

      case 'timerange':
        return this.forTimeRange(place, relativeDate, feature, unitsType);
    }
  }

  async forDate(place: string, relativeDate: RelativeDateTime, feature: WeatherFeature, unitsType: DarkSky.Units): Promise<WeatherCondition> {
    const forecast = await this.forecast.forDate(place, relativeDate, unitsType);
    const { day, flags } = forecast;
    const units = getUnits(feature as DarkSkyFeature, flags.units);

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

      case 'apparentTemperature':
        value = (day.apparentTemperatureHigh + day.apparentTemperatureLow) / 2;

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
        break;

      case 'humidity':
        value = day.humidity;
        break;
    }

    return { value, units, atDate, precipType, wind };
  }

  async forTime(place: string, relativeTime: RelativeDateTime, feature: WeatherFeature, unitsType: DarkSky.Units): Promise<WeatherCondition> {
    const forecast = await this.forecast.forTime(place, relativeTime, unitsType);
    const { hour, flags } = forecast;
    const units = getUnits(feature as DarkSkyFeature, flags.units);

    let value: number;
    let wind: WindCondition;
    let precipType: string;

    switch (feature) {
      case 'temperatureHigh':
      case 'temperatureLow':
      case 'temperature':
        value = hour.temperature;
        break;

      case 'apparentTemperatureHigh':
      case 'apparentTemperatureLow':
      case 'apparentTemperature':
        value = hour.apparentTemperature;
        break;

      case 'precipIntensity':
        value = hour.precipIntensity;
        precipType = hour.precipType;
        break;

      case 'precipAccumulation':
        value = hour.precipAccumulation;
        precipType = hour.precipType;
        break;

      case 'cloudCover':
        value = hour.cloudCover;
        break;

      case 'pressure':
        value = hour.pressure;
        break;

      case 'windSpeed':
        value = hour.windSpeed;
        wind = getWindCondition(hour, unitsType);
        break;

      case 'humidity':
        value = hour.humidity;
        break;
    }

    return { value, units, precipType, wind };
  }

  async forDateRange(place: string, relativeDate: RelativeDateTime, feature: WeatherFeature, unitsType: DarkSky.Units): Promise<WeatherConditionRange> {
    const forecast = await this.forecast.forDateRange(place, relativeDate, unitsType);
    const { daily, flags } = forecast;
    const units = getUnits(feature as DarkSkyFeature, flags.units);
    const values: WeatherValue[] = [];
    const dates: Date[] = [];
    const precipTypes: string[] = [];
    const wind: WindCondition[] = [];

    let day: DarkSky.DataPointDaily;

    const addValue = (day: DarkSky.DataPointDaily, value: number, date?: number) => {
      values.push({ value, units });
      dates.push(createDate(date || day.time));
    };

    switch (feature) {
      case 'temperatureHigh':
        day = maxBy(daily, (x) => x.temperatureHigh);
        addValue(day, day.temperatureHigh, day.temperatureHighTime);
        break;

      case 'temperatureLow':
        day = minBy(daily, (x) => x.temperatureLow);
        addValue(day, day.temperatureLow, day.temperatureLowTime);
        break;

      case 'temperature':
        daily.forEach((x) => addValue(x, (x.temperatureLow + x.temperatureHigh) / 2));
        break;

      case 'apparentTemperatureHigh':
        day = maxBy(daily, (x) => x.apparentTemperatureHigh);
        addValue(day, day.apparentTemperatureHigh, day.apparentTemperatureHighTime);
        break;

      case 'apparentTemperatureLow':
        day = minBy(daily, (x) => x.apparentTemperatureLow);
        addValue(day, day.apparentTemperatureLow, day.apparentTemperatureLowTime);
        break;

      case 'apparentTemperature':
        daily.forEach((x) => addValue(x, (x.apparentTemperatureLow + x.apparentTemperatureHigh) / 2));
        break;

      case 'precipIntensity':
        daily.forEach((x) => {
          addValue(x, x.precipIntensity);
          precipTypes.push(x.precipType);
        });
        break;

      case 'precipAccumulation':
        daily.forEach((x) => {
          addValue(x, x.precipAccumulation);
          precipTypes.push(x.precipType);
        });
        break;

      case 'precipProbability':
        daily.forEach((x) => {
          addValue(x, x.precipProbability);
          precipTypes.push(x.precipType);
        });
        break;

      case 'cloudCover':
        daily.forEach((x) => addValue(x, x.cloudCover));
        break;

      case 'pressure':
        daily.forEach((x) => addValue(x, x.pressure));
        break;

      case 'windSpeed':
        daily.forEach((x) => {
          addValue(x, x.windSpeed);
          wind.push(getWindConditionForDay(x, unitsType));
        });
        break;

      case 'humidity':
        daily.forEach((x) => addValue(x, x.humidity));
        break;
    }

    return { dates, values, wind, precipTypes };
  }

  async forTimeRange(place: string, relativeTime: RelativeDateTime, feature: WeatherFeature, unitsType: DarkSky.Units): Promise<WeatherConditionRange> {
    const forecast = await this.forecast.forDateRange(place, relativeTime, unitsType);
    const { hourly, flags } = forecast;
    const units = getUnits(feature as DarkSkyFeature, flags.units);

    const values: WeatherValue[] = [];
    const dates: Date[] = [];
    const precipTypes: string[] = [];
    const wind: WindCondition[] = [];

    let hour: DarkSky.DataPointHourly;

    const addValue = (hour: DarkSky.DataPointHourly, value: number, date?: number) => {
      values.push({ value, units });
      dates.push(createDate(date || hour.time));
    };

    switch (feature) {
      case 'temperatureHigh':
        hour = maxBy(hourly, (x) => x.temperature);
        addValue(hour, hour.temperature);
        break;

      case 'temperatureLow':
        hour = minBy(hourly, (x) => x.temperature);
        addValue(hour, hour.temperature);
        break;

      case 'temperature':
        hourly.forEach((x) => addValue(x, x.temperature));
        break;

      case 'apparentTemperatureHigh':
        hour = maxBy(hourly, (x) => x.apparentTemperature);
        addValue(hour, hour.apparentTemperature);
        break;

      case 'apparentTemperatureLow':
        hour = minBy(hourly, (x) => x.apparentTemperature);
        addValue(hour, hour.apparentTemperature);
        break;

      case 'apparentTemperature':
        hourly.forEach((x) => addValue(x, x.apparentTemperature));
        break;

      case 'precipIntensity':
        hourly.forEach((x) => {
          addValue(x, x.precipIntensity);
          precipTypes.push(x.precipType);
        });
        break;

      case 'precipAccumulation':
        hourly.forEach((x) => {
          addValue(x, x.precipAccumulation);
          precipTypes.push(x.precipType);
        });
        break;

      case 'precipProbability':
        hourly.forEach((x) => {
          addValue(x, x.precipProbability);
          precipTypes.push(x.precipType);
        });
        break;

      case 'cloudCover':
        hourly.forEach((x) => addValue(x, x.cloudCover));
        break;

      case 'pressure':
        hourly.forEach((x) => addValue(x, x.pressure));
        break;

      case 'windSpeed':
        hourly.forEach((x) => {
          addValue(x, x.windSpeed);
          wind.push(getWindCondition(x, unitsType));
        });
        break;

      case 'humidity':
        hourly.forEach((x) => addValue(x, x.humidity));
        break;
    }

    return { dates, values, wind, precipTypes };
  }
}

function maxBy<T>(items: T[], fn: (x: T) => number) {
  return items.reduce((m, x) => fn(x) > fn(m) ? x : m);
}

function minBy<T>(items: T[], fn: (x: T) => number) {
  return items.reduce((m, x) => fn(x) < fn(m) ? x : m);
}

function getWindConditionForDay(day: DarkSky.DataPointDaily, unitsType: DarkSky.Units) {
  const wind = getWindCondition(day, unitsType);
  wind.gustTime = createDate(day.windGustTime);
  return wind;
}

function getWindCondition(dataPoint: DarkSky.DataPoint, unitsType: DarkSky.Units): WindCondition {
  const { windSpeed, windBearing, windGust } = dataPoint;
  const speed: WeatherValue = {
    value: windSpeed,
    units: getUnits('windSpeed', unitsType),
  };
  const bearing: WeatherValue = {
    value: windBearing,
    units: getUnits('windBearing', unitsType),
  };
  const gust: WeatherValue = {
    value: windGust,
    units: getUnits('windGust', unitsType),
  };

  return { speed, bearing, gust };
}
