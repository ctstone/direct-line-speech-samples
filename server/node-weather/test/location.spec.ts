import { expect } from 'chai';

import { LocationResolver } from '../src/location';
import { MockAzureMap } from './util/mock-azure-map';

const RESP1 = {
  summary: { query: 'foo'},
  results: [
    {
      type: 'Point Address',
      entityType: 'thing',
      position: { lat: 1, lon: 2 },
      address: { freeformAddress: 'Somewhere' },
    },
  ],
};

const RESP2 = {
  TimeZones: [
    { Id: 'America/Los_Angelas' },
  ],
};

const RESP3 = {
  summary: { query: 'foo'},
  results: [
    {
      type: 'Something',
      entityType: 'Municipality',
      position: { lat: 1, lon: 2 },
      address: { freeformAddress: 'Somewhere' },
    },
  ],
};

const RESP4 = {
  summary: { query: 'foo'},
  results: [
    {
      type: 'Something',
      entityType: 'PostalCodeArea',
      position: { lat: 1, lon: 2 },
      address: { freeformAddress: 'Somewhere' },
    },
  ],
};

const RESP5 = {
  summary: { query: 'foo'},
  results: [
    {
      type: 'Nothing',
      entityType: 'Nothing',
      position: { lat: 1, lon: 2 },
      address: { freeformAddress: 'Somewhere' },
    },
  ],
};

const RESP6: any = { TimeZones: [ ] };

describe('Location', () => {
  it('resolves Point Address', async () => {
    const map = new MockAzureMap()
      .onSearchAddress(RESP1)
      .onGetTimeZoneByCoordinates(RESP2);
    const loc = new LocationResolver(map);
    const resp = await loc.resolve('foo');
    expect(resp.coordinates).to.deep.equal([1, 2]);
    expect(resp.timezone).to.equal('America/Los_Angelas');
    expect(resp.description).to.equal('Somewhere');
    expect(resp.type).to.equal('thing');
  });

  it('resolves Municipality', async () => {
    const map = new MockAzureMap()
      .onSearchAddress(RESP3)
      .onGetTimeZoneByCoordinates(RESP2);
    const loc = new LocationResolver(map);
    const resp = await loc.resolve('foo');
    expect(resp.coordinates).to.deep.equal([1, 2]);
    expect(resp.timezone).to.equal('America/Los_Angelas');
    expect(resp.description).to.equal('Somewhere');
    expect(resp.type).to.equal('Municipality');
  });

  it('resolves Postal Code Area', async () => {
    const map = new MockAzureMap()
      .onSearchAddress(RESP4)
      .onGetTimeZoneByCoordinates(RESP2);
    const loc = new LocationResolver(map);
    const resp = await loc.resolve('foo');
    expect(resp.coordinates).to.deep.equal([1, 2]);
    expect(resp.timezone).to.equal('America/Los_Angelas');
    expect(resp.description).to.equal('Somewhere');
    expect(resp.type).to.equal('PostalCodeArea');
  });

  it('ignores empty time zone', async () => {
    const map = new MockAzureMap()
      .onSearchAddress(RESP1)
      .onGetTimeZoneByCoordinates(RESP6);
    const loc = new LocationResolver(map);
    const resp = await loc.resolve('foo');
    expect(resp).to.be.undefined;
  });

  it('ignores other types', async () => {
    const map = new MockAzureMap()
      .onSearchAddress(RESP5)
      .onGetTimeZoneByCoordinates(RESP2);
    const loc = new LocationResolver(map);
    const resp = await loc.resolve('foo');
    expect(resp).to.be.undefined;
  });
});
