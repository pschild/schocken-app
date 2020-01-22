const getRepoInfo = require('git-repo-info');
const { writeFileSync } = require('fs-extra');
const editJsonFile = require('edit-json-file');
const { version } = require('../package.json');
const { resolve } = require('path');

const info = getRepoInfo();
const sha = info.abbreviatedSha;
const buildDateTime = new Date();

// version.ts
const versionFilePath = resolve(__dirname, '..', 'projects', 'hop-web', 'src', 'environments', 'version.ts');
writeFileSync(versionFilePath, `
// AUTO GENERATED! DO NOT MANUALLY EDIT OR CHECKIN!
export const VERSION = '${version}';
export const COMMIT_SHA = '${sha}';
export const COMMIT_DATE = new Date('${buildDateTime}');
`,
  { encoding: 'utf-8' }
);
console.log(`Wrote version info to ${resolve(__dirname, '..', 'projects', 'hop-web', 'src', 'environments', 'version.ts')}`);

// ngsw-config.json
if (process.argv.indexOf('--no-ngsw') > 0) {
  console.log(`Skipping ngsw-config.json`);
} else {
  const ngswConfigFilePath = resolve(__dirname, '..', 'projects', 'hop-web', 'ngsw-config.json');
  const ngswConfigFile = editJsonFile(ngswConfigFilePath);
  ngswConfigFile.set('appData', { version, buildDateTime });
  ngswConfigFile.save();
  console.log(`Wrote version info to ${resolve(__dirname, '..', 'projects', 'hop-web', 'ngsw-config.json')}`);
}