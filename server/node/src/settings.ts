// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

export const PORT = env('PORT', '3978');

export const BOT_SETTINGS = {
  appId: env('MSA_APP_ID'),
  appPassword: env('MSA_PASSWORD'),
};

export function env(name: string, defaultValue?: string) {
  if (process.env.hasOwnProperty(name)) {
    return process.env[name];
  } else if (defaultValue !== undefined) {
    return defaultValue;
  } else {
    throw new Error(`Cannot find environment variable '${name}'`);
  }
}
