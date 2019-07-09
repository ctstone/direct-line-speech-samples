declare module 'chai-bignumber' {

  import { Plugin } from 'chai';

  function chaiBigNumber (BigNumber?: any): Plugin;

  export = chaiBigNumber;

  module 'chai' {
    interface Assertion {
      bignumber: BigNumberAssertion;
    }

    interface BigNumberAssertion {
      equal: BigNumberCompare;
      eq: BigNumberCompare;
      equals: BigNumberCompare;

      above: BigNumberCompare;
      gt: BigNumberCompare;
      greaterThan: BigNumberCompare;

      least: BigNumberCompare;
      gte: BigNumberCompare;

      below: BigNumberCompare;
      lt: BigNumberCompare;
      lessThan: BigNumberCompare;

      most: BigNumberCompare;
      lte: BigNumberCompare;

      finite: Assertion;
      integer: Assertion;
      negative: Assertion;
      zero: Assertion;
    }

    interface BigNumberCompare {
      (value: any, dp?: number, rm?: RoundMode, message?: string): Assertion;
    }

    type RoundUp = 0;
    type RoundDown = 1;
    type RoundCeil = 2;
    type RoundFloor = 3;
    type RoundHalfUp = 4;
    type RoundHalfDown = 5;
    type RoundHalfEven = 6;
    type RoundHalfCeil = 7;
    type RoundHalfFloor = 8;

    type RoundMode
      = RoundUp
      | RoundDown
      | RoundCeil
      | RoundFloor
      | RoundHalfUp
      | RoundHalfDown
      | RoundHalfEven
      | RoundHalfCeil
      | RoundHalfFloor;
  }
}
