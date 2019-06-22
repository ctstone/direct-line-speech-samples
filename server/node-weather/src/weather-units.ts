import DarkSky = require('dark-sky');

export function getUnits(key: keyof (DarkSky.DataPoint & DarkSky.DataPointCurrently & DarkSky.DataPointHourly & DarkSky.DataPointDaily), units: DarkSky.Units) {
  switch (key) {
    case 'temperature':
    case 'temperatureMin':
    case 'temperatureMax':
    case 'temperatureLow':
    case 'temperatureHigh':
    case 'apparentTemperature':
    case 'dewPoint':
      return getTemperatureUnits(units);

    case 'nearestStormDistance':
    case 'visibility':
      return getDistanceUnits(units);

    case 'precipIntensity':
    case 'precipIntensityMax':
      return getPrecipIntensityUnits(units);

    case 'precipAccumulation':
      return getPrecipUnits(units);

    case 'windSpeed':
      return getSpeedUnits(units);

    case 'pressure':
      return getPressureUnits(units);

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
