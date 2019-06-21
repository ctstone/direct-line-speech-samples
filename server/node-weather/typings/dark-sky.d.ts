// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

declare module 'dark-sky' {
  export = DarkSky;

  namespace DarkSky {
    export interface Options {
      latitude: number;
      longitude: number;
      time: string;
      language: string;
      exclude: Block[] | string[];
      extendHourly: boolean;
      units: Units | string;
    }

    export interface Forecast {
      latitude: number;
      longitude: number;
      timezone: string;
      currently: DataPointCurrently;
      minutely: DataBlock;
      hourly: DataBlock<DataPointHourly>;
      daily: DataBlock<DataPointDaily>;
      alerts: Alert[];
      flags: Flags
    }

    export interface Alert {
      description: string;
      expires: number;
      regions: string;
      severity: Severity;
      time: number;
      title: string;
      uri: string;
    }

    export interface Flags {
      ['darksky-unavailable']: string;
      ['nearest-station']: number;
      sources: string[];
      units: Units;
    }

    export interface DataBlock<T extends DataPoint = DataPoint> {
      data: T[];
      summary: string;
      icon: Icon;
    }

    export interface DataPoint {
      cloudCover: number;
      dewPoint: number;
      humidity: number;
      icon: Icon;
      ozone: number;
      precipIntensity: number;
      precipIntensityError: number;
      precipProbability: number;
      precipType: PrecipType;
      pressure: number;
      summary: string;
      time: number;
      uvIndex: number;
      visibility: number;
      windBearing: number;
      windGust: number;
      windSpeed: number;
    }

    export interface DataPointCurrently extends DataPoint {
      nearestStormBearing: number;
      nearestStormDistance: number;
      temperature: number;
    }

    export interface DataPointDaily extends DataPoint {
      apparentTemperatureHigh: number;
      apparentTemperatureHighTime: number;
      apparentTemperatureLow: number;
      apparentTemperatureLowTime: number;
      apparentTemperatureMax: number;
      apparentTemperatureMaxTime: number;
      apparentTemperatureMin: number;
      apparentTemperatureMinTime: number;
      moonPhase: number;
      precipIntensityMax: number;
      precipIntensityMaxTime: number;
      sunriseTime: number;
      sunsetTime: number;
      temperatureHigh: number;
      temperatureHighTime: number;
      temperatureLow: number;
      temperatureLowTime: number;
      temperatureMax: number;
      temperatureMaxTime: number;
      temperatureMin: number;
      temperatureMinTime: number;
      uvIndexTime: number;
      windGustTime: number;
      precipAccumulation: number;
    }

    export interface DataPointHourly extends DataPoint {
      temperature: number;
      apparentTemperature: number;
      precipAccumulation: number;
    }

    export interface Coordinates {
      lat: number | string;
      lng: number | string;
    }

    export type PrecipType = 'rain' | 'snow' | 'sleet';
    export type Severity = 'advisory' | 'watch' | 'warning';
    export type Block = 'currently' | 'minutely' | 'hourly' | 'daily' | 'alerts' | 'flags';
    export type Units = 'auto' | 'ca' | 'uk2' | 'us' | 'si';
    export type Icon = 'clear-day' | 'clear-night' | 'rain' | 'snow' | 'sleet' | 'wind' | 'fog' | 'cloudy' | 'partly-cloudy-day' | 'partly-cloudy-night';
  }

  class DarkSky {
    constructor(key: string);

    latitude(val: string | number): this;
    longitude(val: string | number): this;
    time(val: string | Date): this;
    units(val: string | DarkSky.Units): this;
    language(val: string): this;
    exclude(val: DarkSky.Block | DarkSky.Block[]): this;
    extendHourly(val: boolean): this;
    coordinates(val: Coordinates): this;
    options(val: DarkSky.Options): this;

    get(): Promise<DarkSky.Forecast>;
  }
}
