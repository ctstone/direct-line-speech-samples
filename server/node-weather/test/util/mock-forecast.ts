import { Forecast } from 'dark-sky';
import moment from 'moment';
import 'moment-timezone';

import weather from './weather.json';

const FORECAST_DATE_TZ = moment
  .unix(weather.currently.time)
  .tz(weather.timezone);

export const FORECAST_DATE = FORECAST_DATE_TZ.toDate();
export const DEFAULT_DATE = FORECAST_DATE_TZ.format('YYYY-MM-DD');
export const DEFAULT_TIME = FORECAST_DATE_TZ.format('HH:mm:ss');
export const FORECAST: Forecast = weather as any;
