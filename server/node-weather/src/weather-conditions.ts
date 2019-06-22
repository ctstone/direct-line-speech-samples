import { WeatherForecast } from './weather-forecast';

export type WeatherFeature
  = 'highTemp'
  | 'lowTemp'
  | 'temp'
  | 'precip'
  | 'heat'
  | 'cold'
  | 'cloud'
  | 'sun'
  | 'wind'
  | 'humid'
  | 'fog'
  ;

export class WeatherConditions {
  constructor(private forecast: WeatherForecast) { }

  async forDate(place: string, date: Date, feature: WeatherFeature) {
    const forecast = await this.forecast.forDate(place, date);
  }
}
