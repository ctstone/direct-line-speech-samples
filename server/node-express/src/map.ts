// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import axios, { AxiosInstance } from 'axios';

const API_VERSION = '1.0';
const ENDPOINT = 'https://atlas.microsoft.com';

enum MapParam {
  key = 'subscription-key',
  version = 'api-version',
  clientId = 'x-ms-client-id',
}

export interface AddressSearch {
  query: string;
  limit?: number;
  ofs?: number;
  countrySet?: string[];
  lat?: number;
  lon?: number;
  radius?: number;
  topLeft?: [number, number];
  btmRight?: [number, number];
  language?: string;
  extendedPostalCodesFor?: string[];
}

export interface AddressSearchStructured {
  countrySubdivision?: string;
  countrySecondarySubdivision?: string;
  countryTertiarySubdivision?: string;
  municipalitySubdivision?: string;
  municipality?: string;
  crossStreet?: string;
  postalCode?: string;
  streetName?: string;
  ofs?: number;
  limit?: number;
  countryCode?: string;
  language?: string;
  streetNumber?: string;
  extendedPostalCodesFor?: string;
}

export interface AddressSearchReverse {
  query: string;
  language?: string;
  returnSpeedLimit?: boolean;
  heading?: number;
  radius?: number;
  number?: string;
  returnRoadUse?: boolean;
  roadUse?: string;
  allowFreeformNewline?: boolean;
  dateTime?: string;
  returnMatchType?: boolean;
}

export interface AddressSearchResponse {
  summary: any;
  results: AddressSearchResult[];
}

export interface AddressSearchReverseResponse {
  summary: any;
  addresses: ReverseAddress[];
}

export interface ReverseAddress {
  position: string;
  address: Address;
}

export interface AddressSearchSummary {
  query: string;
  queryType: string;
  queryTime: number;
  numResults: number;
  offset: number;
  totalResults: number;
  fuzzyLevel: number;
}

export interface AddressSearchResult {
  type: string;
  entityType: string;
  id: string;
  score: number;
  address: Address;
  position: Position;
}

export interface Address {
  streetNumber: string;
  streetName: string;
  municipalitySubdivision: string;
  municipality: string;
  countrySecondarySubdivision: string;
  countryTertiarySubdivision: string;
  countrySubdivision: string;
  postalCode: string;
  extendedPostalCode: string;
  countryCode: string;
  country: string;
  countryCodeISO3: string;
  freeformAddress: string;
  countrySubdivisionName: string;
}

export interface Position {
  lat: number;
  lon: number;
}

export enum TimezoneOptions {
  all = 'all',
  none = 'none',
  transitions = 'transitions',
  zoneInfo = 'zoneInfo',
}

export interface TimezoneQuery {
  options?: TimezoneOptions;
  timestamp?: string;
  transitionsFrom?: string;
  transitionsYears?: string;
}

export interface TimezoneResponse {
  ReferenceUtcTimestamp: string;
  TimeZones: Timezone[];
  Version: string;
}

export interface Timezone {
  Aliases: string[];
  Countries: Country[];
  Id: string;
  Names: Names[];
  ReferenceTime: ReferenceTime;
  RepresentativePoint: RepresentativePoint;
  TimeTransitions: TimeTransition[];
}

export interface Country {
  Code: string;
  Name: string;
}

export interface Names {
  Daylight: string;
  Generic: string;
  ISO6391LanguageCode: string;
  Standard: string;
}

export interface ReferenceTime {
  DaylightSavings: string;
  PosixTz: string;
  PosixTzValidYear: string;
  StandardOffset: string;
  Tag: string;
  WallTime: string;
}

export interface RepresentativePoint {
  Latitude: number;
  Longitude: number;
}

export interface TimeTransition {
  DaylightSavings: string;
  StandardOffset: string;
  Tag: string;
  UtcEnd: string;
  UtcStart: string;
}

export class AzureMap {

  private readonly api: AxiosInstance;
  private readonly baseParams: any;

  constructor(key: string) {
    this.api = axios.create({
      baseURL: ENDPOINT,
    });
    this.baseParams = {
      [MapParam.version]: API_VERSION,
      [MapParam.key]: key,
    };
  }

  async searchAddress(options: AddressSearch): Promise<AddressSearchResponse> {
    const optionalParams: { [key: string]: string | number | boolean } = {};
    (Object.keys(options) as Array<keyof AddressSearch>)
      .forEach((k) => {
        const value = options[k];
        optionalParams[k] = Array.isArray(value) ? value.join(',') : value;
      });
    const params = this.assignParams(optionalParams);
    return await this.api.get('search/address/json', { params });
  }

  async searchAddressStructured(options: AddressSearchStructured): Promise<AddressSearchResponse> {
    const params = this.assignParams(options);
    return await this.api.get('search/address/structured/json', { params });
  }

  async searchAddressReverse(options: AddressSearchReverse): Promise<AddressSearchReverseResponse> {
    const params = this.assignParams(options);
    return await this.api.get('search/address/reverse/json', { params });
  }

  async getTimezoneByCoordinates(coordinates: [number, number], options?: TimezoneQuery, language?: string): Promise<TimezoneResponse> {
    const params = this.assignParams({ query: coordinates.join(',') }, options);
    const headers = { 'Accept-Language': language };
    return await this.api.get('timezone/byCoordinates/json', { params, headers });
  }

  private assignParams(...params: any[]) {
    return Object.assign({}, ...params, this.baseParams);
  }
}
