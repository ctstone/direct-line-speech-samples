import { DataPoint, DataPointDaily, DataPointHourly } from 'dark-sky';

import { createDate, RelativeDateTime } from './time';
import { Forecast, WeatherForecast, WeatherOptions } from './weather-forecast';
import { DarkSkyFeature, getUnits, getUnitsFor } from './weather-units';

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
  | 'humidity'
  | 'ozone';

export interface WeatherConditions {
  value?: WeatherCondition;
  range?: WeatherConditionRange;
}

export interface WeatherCondition extends WeatherValue {
  forecast: Forecast;
  atDate?: Date;
  precip: Precipitation;
  wind?: WindCondition;
}

export interface WeatherConditionRange {
  dates: Date[];
  values: WeatherValue[];
  forecast: Forecast;
  precips?: Precipitation[];
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

export interface Precipitation {
  type: string;
  intensity: WeatherValue;
  accumulation: WeatherValue;
  probability: WeatherValue;
}

const DEFAULT_UNITS = 'us';

export class WeatherForecastConditions {
  constructor(private forecast: WeatherForecast) { }

  async lookup(place: string, relativeDate: RelativeDateTime, feature: WeatherFeature, options?: WeatherOptions): Promise<WeatherConditions> {
    let value: WeatherCondition;
    let range: WeatherConditionRange;

    switch (relativeDate.type) {
      case 'date':
      case 'datetime':
        value = await this.forDate(place, relativeDate, feature, options);
        break;

      case 'time':
        value = await this.forTime(place, relativeDate, feature, options);
        break;

      case 'daterange':
        range = await this.forDateRange(place, relativeDate, feature, options);
        break;

      case 'datetimerange':
      case 'timerange':
        range = await this.forTimeRange(place, relativeDate, feature, options);
        break;
    }

    return { value, range };
  }

  async forDate(place: string, relativeDate: RelativeDateTime, feature: WeatherFeature, options?: WeatherOptions): Promise<WeatherCondition> {
    const forecast = await this.forecast.forDate(place, relativeDate, options);
    if (forecast) {
      const { day, flags } = forecast;
      const units = getUnits(feature as DarkSkyFeature, flags.units);

      let value: number;
      let atDate: Date;
      let precip: Precipitation;
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
        case 'precipAccumulation':
        case 'precipProbability':
          precip = getPrecipitation(day, options);
          break;

        case 'cloudCover':
          value = day.cloudCover;
          break;

        case 'pressure':
          value = day.pressure;
          break;

        case 'windSpeed':
          value = day.windSpeed;
          wind = getWindConditionForDay(day, options);
          break;

        case 'humidity':
          value = day.humidity;
          break;

        case 'ozone':
          value = day.ozone;
          break;
      }

      return { value, units, atDate, precip, wind, forecast };
    }
  }

  async forTime(place: string, relativeTime: RelativeDateTime, feature: WeatherFeature, options?: WeatherOptions): Promise<WeatherCondition> {
    const forecast = await this.forecast.forTime(place, relativeTime, options);
    if (forecast) {

      const { hour, flags } = forecast;
      const units = getUnits(feature as DarkSkyFeature, flags.units);

      let value: number;
      let wind: WindCondition;
      let precip: Precipitation;

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
        case 'precipAccumulation':
        case 'precipProbability':
          precip = getPrecipitation(hour, options);

        case 'cloudCover':
          value = hour.cloudCover;
          break;

        case 'pressure':
          value = hour.pressure;
          break;

        case 'windSpeed':
          value = hour.windSpeed;
          wind = getWindCondition(hour, options);
          break;

        case 'humidity':
          value = hour.humidity;
          break;

        case 'ozone':
          value = hour.ozone;
          break;
      }

      return { value, units, precip, wind, forecast };
    }
  }

  async forDateRange(place: string, relativeDate: RelativeDateTime, feature: WeatherFeature, options?: WeatherOptions): Promise<WeatherConditionRange> {
    const forecast = await this.forecast.forDateRange(place, relativeDate, options);
    if (forecast) {
      const { daily, flags } = forecast;
      const units = getUnits(feature as DarkSkyFeature, flags.units);
      const values: WeatherValue[] = [];
      const dates: Date[] = [];
      const precips: Precipitation[] = [];
      const wind: WindCondition[] = [];

      let day: DataPointDaily;

      const addValue = (day: DataPointDaily, value: number, date?: number) => {
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

        case 'precipAccumulation':
        case 'precipIntensity':
        case 'precipProbability':
          daily.forEach((x) => {
            addValue(x, null);
            precips.push(getPrecipitation(x, options));
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
            wind.push(getWindConditionForDay(x, options));
          });
          break;

        case 'humidity':
          daily.forEach((x) => addValue(x, x.humidity));
          break;

        case 'ozone':
          daily.forEach((x) => addValue(x, x.ozone));
          break;
      }

      return { dates, values, wind, precips, forecast };
    }
  }

  async forTimeRange(place: string, relativeTime: RelativeDateTime, feature: WeatherFeature, options?: WeatherOptions): Promise<WeatherConditionRange> {
    const forecast = await this.forecast.forDateRange(place, relativeTime, options);
    if (forecast) {
      const { hourly, flags } = forecast;
      const units = getUnits(feature as DarkSkyFeature, flags.units);

      const values: WeatherValue[] = [];
      const dates: Date[] = [];
      const precips: Precipitation[] = [];
      const wind: WindCondition[] = [];

      let hour: DataPointHourly;

      const addValue = (hour: DataPointHourly, value: number, date?: number) => {
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

        case 'precipAccumulation':
        case 'precipIntensity':
        case 'precipProbability':
          hourly.forEach((x) => {
            addValue(x, null);
            precips.push(getPrecipitation(x, options));
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
            wind.push(getWindCondition(x, options));
          });
          break;

        case 'humidity':
          hourly.forEach((x) => addValue(x, x.humidity));
          break;

        case 'ozone':
          hourly.forEach((x) => addValue(x, x.ozone));
          break;
      }

      return { dates, values, wind, precips, forecast };
    }
  }
}

// function round(val: number, p?: number): number {
//   const n = Math.pow(10, p || 0);
//   return Math.round(val * n) / n;
// }

function maxBy<T>(items: T[], fn: (x: T) => number) {
  return items.reduce((m, x) => fn(x) > fn(m) ? x : m);
}

function minBy<T>(items: T[], fn: (x: T) => number) {
  return items.reduce((m, x) => fn(x) < fn(m) ? x : m);
}

function getWindConditionForDay(day: DataPointDaily, options: WeatherOptions = {}) {
  const wind = getWindCondition(day, options);
  wind.gustTime = createDate(day.windGustTime);
  return wind;
}

function getWindCondition(dataPoint: DataPoint, options: WeatherOptions = {}): WindCondition {
  const { windSpeed, windBearing, windGust } = dataPoint;
  const getUnits = getUnitsFor(options.units || DEFAULT_UNITS);
  const speed: WeatherValue = {
    value: windSpeed,
    units: getUnits('windSpeed'),
  };
  const bearing: WeatherValue = {
    value: windBearing,
    units: getUnits('windBearing'),
  };
  const gust: WeatherValue = {
    value: windGust,
    units: getUnits('windGust'),
  };

  return { speed, bearing, gust };
}

function getPrecipitation(point: DataPointHourly | DataPointDaily, options: WeatherOptions = {}): Precipitation {
  const { precipType: type, precipIntensity, precipProbability, precipAccumulation } = point;
  const getUnits = getUnitsFor(options.units || DEFAULT_UNITS);
  const intensity = {
    value: precipIntensity,
    units: getUnits('precipIntensity'),
  };
  const accumulation = {
    value: precipAccumulation,
    units: getUnits('precipAccumulation'),
  };
  const probability = {
    value: precipProbability,
    units: getUnits('precipProbability'),
  };
  return { type, intensity, accumulation, probability };
}
