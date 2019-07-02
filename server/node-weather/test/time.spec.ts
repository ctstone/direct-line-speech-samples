import { expect } from 'chai';
import { createDate, getTimestamp } from '../src/time';

describe('Time', () => {
  it('converts to UNIX timestamp', () => {
    const d = new Date('2000-01-01');
    expect(getTimestamp(d)).to.equal(946684800);
  });

  it('converts from UNIX timestamp', () => {
    const d = createDate(946684800);
    expect(d.toISOString()).to.equal('2000-01-01T00:00:00.000Z');
  });
});
