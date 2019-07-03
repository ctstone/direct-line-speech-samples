import { expect } from 'chai';
import mockdate from 'mockdate';

import { createDate, findTime, findTimeRange, getTimestamp, parseTime, resolveDate } from '../src/time';

const CANDIDATES = [
  '2000-01-02',
  '2000-01-03',
  '2000-01-04',
  '2000-01-05',
].map((x) => ({ time: getTimestamp(new Date(x)) }));

describe('Time', () => {

  beforeEach(() => {
    mockdate.set('2000-01-01T12:01:02Z');
  });

  it('converts to UNIX timestamp', () => {
    const d = new Date('2000-01-01');
    expect(getTimestamp(d)).to.equal(946684800);
  });

  it('converts from UNIX timestamp', () => {
    const d = createDate(946684800);
    expect(d.toISOString()).to.equal('2000-01-01T00:00:00.000Z');
  });

  it('parses timezone', () => {
    const time = '10:00:00';
    const tz = 'America/New_York';
    const res = parseTime(time, tz);
    expect(res.toISOString()).to.equal('2000-01-01T15:00:00.000Z');
  });

  it('finds time range', () => {
    const start = new Date('2000-01-03');
    const end = new Date('2000-01-04');
    const res = findTimeRange(start, end, CANDIDATES);
    expect(res.length).to.equal(1);
    expect(res[0].time).to.equal(getTimestamp(new Date('2000-01-03')));
  });

  describe('Find Time', () => {
    it('finds nearest day', () => {
      const d = new Date('2000-01-03');
      const res = findTime(d, 'day', CANDIDATES);
      expect(res.time).to.equal(getTimestamp(new Date('2000-01-03')));
    });

    it('finds nearest day edge low', () => {
      const d = new Date('2000-01-02');
      const res = findTime(d, 'day', CANDIDATES);
      expect(res.time).to.equal(getTimestamp(new Date('2000-01-02')));
    });

    it('finds nearest day edge high', () => {
      const d = new Date('2000-01-05');
      const res = findTime(d, 'day', CANDIDATES);
      expect(res.time).to.equal(getTimestamp(new Date('2000-01-05')));
    });

    it('ignores out of bounds high', () => {
      const d = new Date('2000-01-06');
      const res = findTime(d, 'day', CANDIDATES);
      expect(res).to.be.undefined;
    });

    it('ignores out of bounds low', () => {
      const d = new Date('2000-01-01');
      const res = findTime(d, 'day', CANDIDATES);
      expect(res).to.be.undefined;
    });
  });

  describe('Resolve Date', () => {

    it('resolves date', () => {
      const tz = 'America/New_York';
      const value = '2001-01-01';
      const { type, start, end } = resolveDate({ type: 'date', value }, tz);
      expect(type).to.equal('date');
      expect(start.toISOString()).to.equal('2001-01-01T05:00:00.000Z');
      expect(end).to.be.undefined;
    });

    it('resolves datetime', () => {
      const tz = 'America/New_York';
      const value = '2001-01-01T10:12:34';
      const { type, start, end } = resolveDate({ type: 'datetime', value }, tz);
      expect(type).to.equal('datetime');
      expect(start.toISOString()).to.equal('2001-01-01T15:12:34.000Z');
      expect(end).to.be.undefined;
    });

    it('resolves daterange', () => {
      const tz = 'America/New_York';
      const startDate = '2001-01-01';
      const endDate = '2001-01-05';
      const { type, start, end } = resolveDate({ type: 'daterange', start: startDate, end: endDate }, tz);
      expect(type).to.equal('daterange');
      expect(start.toISOString()).to.equal('2001-01-01T05:00:00.000Z');
      expect(end.toISOString()).to.equal('2001-01-05T05:00:00.000Z');
    });

    it('resolves datetimerange', () => {
      const tz = 'America/New_York';
      const startDate = '2001-01-01T10:12:34';
      const endDate = '2001-01-05T12:34:56';
      const { type, start, end } = resolveDate({ type: 'datetimerange', start: startDate, end: endDate }, tz);
      expect(type).to.equal('datetimerange');
      expect(start.toISOString()).to.equal('2001-01-01T15:12:34.000Z');
      expect(end.toISOString()).to.equal('2001-01-05T17:34:56.000Z');
    });

    it('resolves time', () => {
      const tz = 'America/New_York';
      const value = '10:12:34';
      const { type, start, end } = resolveDate({ type: 'time', value }, tz);
      expect(type).to.equal('time');
      expect(start.toISOString()).to.equal('2000-01-01T15:12:34.000Z');
      expect(end).to.be.undefined;
    });

    it('resolves timerange', () => {
      const tz = 'America/New_York';
      const startTime = '10:12:34';
      const endTime = '12:34:56';
      const { type, start, end } = resolveDate({ type: 'timerange', start: startTime, end: endTime }, tz);
      expect(type).to.equal('timerange');
      expect(start.toISOString()).to.equal('2000-01-01T15:12:34.000Z');
      expect(end.toISOString()).to.equal('2000-01-01T17:34:56.000Z');
    });
  });
});
