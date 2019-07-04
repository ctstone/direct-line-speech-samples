import DarkSky from 'dark-sky';
import { Mock, MOCK_SELF } from './mock';
import { FORECAST } from './mock-forecast';

export function mockDarkSky() {
  const forecast = FORECAST;
  const darkSky = new Mock<DarkSky>()
    .on('latitude', MOCK_SELF)
    .on('longitude', MOCK_SELF)
    .on('exclude', MOCK_SELF)
    .on('language', MOCK_SELF)
    .on('units', MOCK_SELF)
    .onPromised('get', forecast)
    .mock();
  return { forecast, darkSky };
}
