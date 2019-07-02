import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { expect } from 'chai';

import { AzureMap } from '../src/azure-map';

const KEY = 'fake-key';
const ENDPOINT = 'https://atlas.microsoft.com';
const RESP1 = { summary: { query: 'foo' }, results: [ { type: 'Point Address'} ] };
const RESP2 = { Version: '2019a', TimeZones: [ { Id: 'America/Los_Angelas' } ] };

describe('Azure Maps', () => {

  it('sets required query parameters', async () => {
    const mock = new MockAdapter(axios)
      .onGet(`${ENDPOINT}/search/address/json`)
      .reply(200, RESP1);
    const map = new AzureMap(KEY);
    await map.searchAddress('foo');
    expect(mock.history.get[0].params['subscription-key']).to.equal(KEY);
    expect(mock.history.get[0].params['api-version']).to.be.a('string');
  });

  it('captures HTTP error message', async () => {
    new MockAdapter(axios)
      .onGet(`${ENDPOINT}/search/address/json`)
      .reply(400, { error: { message: 'oops', code: '400'}});
    const map = new AzureMap(KEY);
    try {
      await map.searchAddress('foo');
      expect.fail();
    } catch (err) {
      expect(err.message).to.equal('oops');
      expect(err.code).to.equal(400);
    }
  });

  it('captures HTTP error message without error message', async () => {
    new MockAdapter(axios)
      .onGet(`${ENDPOINT}/search/address/json`)
      .reply(500);
    const map = new AzureMap(KEY);
    try {
      await map.searchAddress('foo');
      expect.fail();
    } catch (err) {
      expect(err.message).to.be.a('string');
      expect(err.code).to.equal(500);
    }
  });

  it('captures transport error', async () => {
    new MockAdapter(axios)
      .onGet(`${ENDPOINT}/search/address/json`)
      .networkError();
    const map = new AzureMap(KEY);
    try {
      await map.searchAddress('foo');
      expect.fail();
    } catch (err) {
      expect(err.message).to.equal('Network Error');
    }
  });

  describe('Search Address', () => {
    it('passes results without options', async () => {
      const mock = new MockAdapter(axios)
        .onGet(`${ENDPOINT}/search/address/json`)
        .reply(200, RESP1);
      const map = new AzureMap(KEY);
      const resp = await map.searchAddress('foo');
      expect(mock.history.get[0].params.query).to.equal('foo');
      expect(resp.results[0].type).to.equal(RESP1.results[0].type);
      expect(resp.summary.query).to.equal(RESP1.summary.query);
    });

    it('passes results with options', async () => {
      const mock = new MockAdapter(axios)
        .onGet(`${ENDPOINT}/search/address/json`)
        .reply(200, RESP1);
      const map = new AzureMap(KEY);
      const resp = await map.searchAddress('foo', { typeahead: true, topLeft: [1, 2] });
      expect(mock.history.get[0].params.query).to.equal('foo');
      expect(mock.history.get[0].params.typeahead).to.equal(true);
      expect(mock.history.get[0].params.topLeft).to.equal('1,2');
      expect(resp.results[0].type).to.equal(RESP1.results[0].type);
      expect(resp.summary.query).to.equal(RESP1.summary.query);
    });
  });

  describe('Timezone by Coordinates', () => {
    it('passes results without options', async () => {
      const mock = new MockAdapter(axios)
        .onGet(`${ENDPOINT}/timezone/byCoordinates/json`)
        .reply(200, RESP2);
      const map = new AzureMap(KEY);
      const resp = await map.getTimezoneByCoordinates([1, 2]);
      expect(mock.history.get[0].params.query).to.equal('1,2');
      expect(resp.Version).to.equal(RESP2.Version);
    });

    it('passes results with options', async () => {
      const mock = new MockAdapter(axios)
        .onGet(`${ENDPOINT}/timezone/byCoordinates/json`)
        .reply(200, RESP2);
      const map = new AzureMap(KEY);
      const resp = await map.getTimezoneByCoordinates([1, 2], { options: 'all'});
      expect(mock.history.get[0].params.query).to.equal('1,2');
      expect(mock.history.get[0].params.options).to.equal('all');
      expect(resp.Version).to.equal(RESP2.Version);
    });

    it('passes results with language', async () => {
      const mock = new MockAdapter(axios)
        .onGet(`${ENDPOINT}/timezone/byCoordinates/json`)
        .reply(200, RESP2);
      const map = new AzureMap(KEY);
      const resp = await map.getTimezoneByCoordinates([1, 2], null, 'EN');
      expect(mock.history.get[0].params.query).to.equal('1,2');
      expect(mock.history.get[0].headers['accept-language']).to.equal('EN');
      expect(resp.Version).to.equal(RESP2.Version);
    });
  });
});
