import { expect } from 'chai';

import * as settings from '../src/settings';

describe('Settings', () => {
  it('fails on missing environment variable', () => {
    try {
      const foo = settings.env('foo');
    } catch (err) {
      return;
    }
    expect.fail();
  });
});
