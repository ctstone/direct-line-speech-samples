import DarkSky = require('dark-sky');

export type DarkSkyFeature = keyof (DarkSky.DataPoint & DarkSky.DataPointCurrently & DarkSky.DataPointHourly & DarkSky.DataPointDaily);

export function getUnits(feature: DarkSkyFeature, unitsType: DarkSky.Units) {
  switch (feature) {
    case 'temperature':
    case 'temperatureMin':
    case 'temperatureMax':
    case 'temperatureLow':
    case 'temperatureHigh':
    case 'apparentTemperature':
    case 'dewPoint':
      return getTemperatureUnits(unitsType);

    case 'nearestStormDistance':
    case 'visibility':
      return getDistanceUnits(unitsType);

    case 'precipIntensity':
    case 'precipIntensityMax':
      return getPrecipIntensityUnits(unitsType);

    case 'precipAccumulation':
      return getPrecipUnits(unitsType);

    case 'windSpeed':
      return getSpeedUnits(unitsType);

    case 'pressure':
      return getPressureUnits(unitsType);

    case 'cloudCover':
    case 'precipProbability':
      return '%';

    default:
      return '';
  }
}

function getTemperatureUnits(units: DarkSky.Units) {
  switch (units) {
    case 'us':
      return 'degrees Fahrenheit';
    default:
      return 'degrees Celsius';
  }
}

function getDistanceUnits(units: DarkSky.Units) {
  switch (units) {
    case 'us':
    case 'uk2':
      return 'miles';
    default:
      return 'kilometers';
  }
}

function getPrecipIntensityUnits(units: DarkSky.Units) {
  switch (units) {
    case 'us':
      return 'inches per hour';
    default:
      return 'millimeters per hour';
  }
}

function getPrecipUnits(units: DarkSky.Units) {
  switch (units) {
    case 'us':
      return 'inches';
    default:
      return 'centimeters';
  }
}

function getSpeedUnits(units: DarkSky.Units) {
  switch (units) {
    case 'us':
    case 'uk2':
      return 'miles per hour';
    case 'ca':
      return 'kilometers per hour';
    default:
      return 'meters per second';
  }
}

function getPressureUnits(units: DarkSky.Units) {
  switch (units) {
    case 'us':
      return 'millibars';
    default:
      return 'hectopascals';
  }
}
