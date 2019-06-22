import { AzureMap } from './azure-map';

export type Latitude = number;
export type Longitude = number;
export type Coordinates = [ Latitude, Longitude ];

export interface Location {
  coordinates: Coordinates;
  description: string;
  type: string;
  timezone: string;
}

export class LocationResolver {
  constructor(private map: AzureMap) { }

  async resolve(place: string) {
    const searchResp = await this.map.searchAddress(place);
    const top = searchResp.results.find((x) => {
      return x.type === 'Point Address' || x.entityType === 'Municipality' || x.entityType === 'PostalCodeArea';
    });

    if (top) {
      const { entityType, position: { lat, lon }, address: { freeformAddress } } = top;
      const coordinates: Coordinates = [lat, lon];
      const timezoneResp = await this.map.getTimezoneByCoordinates([lat, lon]);

      if (timezoneResp.TimeZones.length) {
        const description = freeformAddress;
        const type = entityType;
        const [ { Id: timezone } ] = timezoneResp.TimeZones;
        return { coordinates, timezone, description, type } as Location;
      }
    }
  }
}
