import { AddressSearchResponse, AzureMap, TimezoneResponse } from '../../src/azure-map';

export class MockAzureMap extends AzureMap {

  private readonly searchAddressResponses: Array<AddressSearchResponse | Error> = [];
  private readonly timezoneByCoordinatesResponses: Array<TimezoneResponse | Error> = [];
  private searchAddressResponseIndex = 0;
  private timezoneByCoordinatesIndex = 0;

  constructor() {
    super('KEY');
  }

  onSearchAddress(resp: any) {
    this.searchAddressResponses.push(resp);
    return this;
  }

  onGetTimeZoneByCoordinates(resp: any) {
    this.timezoneByCoordinatesResponses.push(resp);
    return this;
  }

  searchAddress(...args: any[]) {
    const resp = this.searchAddressResponses[this.searchAddressResponseIndex];
    this.searchAddressResponseIndex += 1;
    if (resp instanceof Error) {
      return Promise.reject(resp);
    } else if (resp) {
      return Promise.resolve(resp);
    } else {
      return Promise.reject(new Error('No mock response!'));
    }
  }

  getTimezoneByCoordinates(...args: any[]) {
    const resp = this.timezoneByCoordinatesResponses[this.timezoneByCoordinatesIndex];
    this.searchAddressResponseIndex += 1;
    if (resp instanceof Error) {
      return Promise.reject(resp);
    } else if (resp) {
      return Promise.resolve(resp);
    } else {
      return Promise.reject(new Error('No mock response!'));
    }
  }
}
