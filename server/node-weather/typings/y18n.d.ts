declare module 'y18n' {
  export = Y18N;

  namespace Y18N {
    export interface Options {

      /** The locale directory (default `./locales`) */
      directory?: string;

      /** Should newly observed strings be updated in file (default `true`)? */
      updateFiles?: boolean;

      /** What locale should be used? */
      locale?: string;

      /** Should fallback to a language-only file (e.g. `en.json`) be allowed if a file matching the locale does not exist (e.g. `en_US.json`) (default `true`) */
      fallbackToLanguage?: boolean;
    }

    export interface LocaleStrings {
      [text: string]: string;
    }
  }

  class Y18N {
    /** Create an instance of y18n with the config provided */
    constructor(options?: Y18N.Options);

    /**
     * Print a localized string, `%s` will be replaced with args.
     * 
     * This function can also be used as a tag for a template literal:
     * @example
     * __`hello ${'world'}.
     * // Equivalent to: __('hello %s', 'world').
     * 
     * @param text Text template
     * @param args Template argument values
     */
    __(text: string, ...args: string[]): string;

    /**
     * Print a localized string with appropriate pluralization.
     * If `%d` is provided in the string, the count will replace this placeholder.
     * @param singularText Text template for singular `count` value
     * @param pluralText Text template for plural `count` value
     * @param count Actual value to evaluate
     * @param args Template argument values
     */
    __n(singularText: string, pluralText: string, count: number, ...args: string[]): string;

    /**
     * Set the current locale to be used
     * @param locale Locale string
     */
    setLocale(locale: string): void;

    /**
     * Get the current locale
     */
    getLocale(): string;

    /**
     * Update the current locale with the provided key-value pairs
     * @param strings Template to localized key-value pairs
     */
    updateLocale(strings: Y18N.LocaleStrings): void;
  }
}