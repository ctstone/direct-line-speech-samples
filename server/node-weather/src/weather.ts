import * as DarkSky from 'dark-sky';

import { LocationResolver } from './location';
import { WeatherForecast } from './weather-forecast';

export class Weather {

  forecast: WeatherForecast;

  constructor(private locationResolver: LocationResolver, private darkSky: DarkSky) {
    this.forecast = new WeatherForecast(locationResolver, darkSky);
  }
}
