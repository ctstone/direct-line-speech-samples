import DarkSky from 'dark-sky';
import { Mock, MOCK_SELF } from './mock';

export function mockDarkSky(forecast: any) {
  return new Mock<DarkSky>()
    .on('latitude', MOCK_SELF)
    .on('longitude', MOCK_SELF)
    .on('exclude', MOCK_SELF)
    .on('language', MOCK_SELF)
    .on('units', MOCK_SELF)
    .onPromised('get', forecast)
    .mock();
}
