// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

export enum WeatherIntent {
  getConditionsFeature = 'Weather_Conditions_GetFeature',
  getForecast = 'Weather_GetForecast',
  getConditionsYesNo = 'Weather_Conditions_YesNo',
  none = 'None',
}

export enum WeatherEntity {
  location = 'Weather_Location',
  condition = 'Weather_Condition',
  gear = 'Weather_Gear',
  precipitation = 'Weather_Precipitation',
  countryRegion = 'geographyV2_countryRegion',
  city = 'geographyV2_city',
  state = 'geographyV2_state',
  poi = 'geographyV2_poi',
  datetime = 'datetime',
}

export enum WeatherCondition {
  heat = 'heat',
  cold = 'cold',
  humidity = 'humidity',
  sun = 'sun',
  cloudCoverage = 'cloudCoverage',
  windGust = 'windGust',
  fog = 'fog',
  temperature = 'temperature',
  high = 'high',
  low = 'low',
  ozone = 'ozone',
}

export enum WeatherPrecipitation {
  any = 'any',
  rain = 'rain',
  snow = 'snow',
  sleet = 'sleet',
}
