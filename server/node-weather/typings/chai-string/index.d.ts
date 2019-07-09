declare module 'chai-string' {

  import { Plugin } from 'chai';

  const chaiString: Plugin;

  export = chaiString;

  module 'chai' {
    interface Assertion {
      startWith(val: string): Assertion;
      startsWith(val: string): Assertion;
      equalIgnoreCase(val: string): Assertion;
    }
  }
}