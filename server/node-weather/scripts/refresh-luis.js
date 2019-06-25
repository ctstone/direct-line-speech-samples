const ludown = require('ludown');
const luis = require('luis-apis');
const fs = require('fs');
const path = require('path');
const msRest = require('ms-rest-js');

const [, , userAuthorKey, userAppId, userFile] = process.argv;

const appId = userAppId || process.env.LUIS_APP_ID_WEATHER;
const authorKey = userAuthorKey || process.env.LUIS_AUTHOR_KEY;
const fileName = userFile || path.resolve(__dirname, '..', 'data', 'luis', 'weather.lu');

if (!fileName || !authorKey || !appId) {
  console.error('Usage: refresh-luis [<authorKey>] [appId] [<file>]');
  console.error('\nOr set environment variable LUIS_APP_ID_WEATHER=appId');
  process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

async function main() {
  const region = 'westus';
  const cloud = 'com';
  const creds = new msRest.ApiKeyCredentials({ inHeader: { "Ocp-Apim-Subscription-Key": authorKey } });
  const author = new luis.LuisAuthoring(creds);
  const content = fs.readFileSync(fileName, 'utf8');
  const parsed = await ludown.parser.parseFile(content);

  console.error('Getting information about the app');
  const {
    name,
    desc,
    description,
    culture,
    luis_schema_version,
  } = await author.apps.get(region, cloud, appId);

  console.error('Getting existing app versions');
  const appVerions = await author.versions.list(region, cloud, appId);
  const versionInfo = appVerions[0];
  const origVersionId = +versionInfo.version;
  const versionIdNumber = origVersionId + (origVersionId < 1 ? 0.1 : 1);
  const versionId = (versionIdNumber < 1 ? Math.round(versionIdNumber * 10) / 10 : versionId).toString();

  const luisApp = Object.assign(parsed.LUISJsonStructure, {
    name,
    versionId,
    desc: desc || description || '',
    culture,
    luis_schema_version: luis_schema_version || '3.0.0' });

  console.error(`Importing new version to app with id ${appId} and version ${versionId}`);

  await author.versions.importMethod(region, cloud, appId, luisApp);

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
  await author.apps.publish(region, cloud, appId, { versionId: versionId });

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