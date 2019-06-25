const ludown = require('ludown');
const luis = require('luis-apis');
const fs = require('fs');
const path = require('path');
const msRest = require('ms-rest-js');

const [, , userAuthorKey, userCulture, userAppName, userFile] = process.argv;

const authorKey = userAuthorKey || process.env.LUIS_AUTHOR_KEY;
const fileName = userFile || path.resolve(__dirname, '..', 'data', 'luis', 'weather.lu');

if (!fileName || !authorKey) {
  console.error('Usage: publish-luis [<authorKey>] [culture] [appName] [filePath]');
  console.error('\nOr set environment variable LUIS_AUTHOR_KEY=key')
  process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

async function main() {
  const region = 'westus';
  const cloud = 'com';
  const culture = userCulture || 'en-us';
  const appName = userAppName || 'WeatherDemo';
  const creds = new msRest.ApiKeyCredentials({ inHeader: { "Ocp-Apim-Subscription-Key": authorKey } });
  const author = new luis.LuisAuthoring(creds);
  const content = fs.readFileSync(fileName, 'utf8');
  const parsed = await ludown.parser.parseFile(content, false, culture);
  const luisApp = parsed.LUISJsonStructure;

  const apps = await author.apps.list(region, cloud);
  const existing = apps.find((x) => x.name === appName);
  if (existing) {
    console.error(`Deleting existing app with name "${existing.name}"`);
    await author.apps.deleteMethod(region, cloud, existing.id);
  }

  console.error(`Importing app with name "${appName}"`);

  luisApp.luis_schema_version = '3.0.0';
  luisApp.versionId = '0.1';
  luisApp.name = appName;
  luisApp.desc = '';
  luisApp.culture = culture;

  const importAppResp = await author.apps.importMethod(region, cloud, luisApp);
  const appId = importAppResp.body;
  const versionId = '0.1';

  console.error(`Training app with ID "${appId}"`);
  await author.train.trainVersion(region, cloud, appId, versionId);
  let completed = [];
  while (true) {
    const statusResp = await author.train.getStatus(region, cloud, appId, versionId);
    completed = statusResp.filter((x) => x.details.status === 'Fail' || x.details.status === 'UpToDate' || x.details.status === 'Success');
    console.error(`  [ ${completed.length} / ${statusResp.length} ]`);
    if (completed.length === statusResp.length) {
      break;
    }
    await delay(2000);
  }
  const failed = completed.filter((x) => x.details.status === 'Fail');
  if (failed.length) {
    console.error(failed);
    throw new Error('Training failed!');
  }

  console.error('Publishing app');
  await author.apps.publish(region, cloud, appId, { versionId });

  console.error(`Setting app to public`);
  await author.apps.updateSettings(region, cloud, appId, { isPublic: true });

  console.error('Done!\n');

  console.log(appId);
}

function delay(ms) {
  return new Promise((resolve, reject) => {
    try {
      setTimeout(resolve, ms);
    } catch (err) {
      reject(err);
    }
  })
}