const getRepoInfo = require('git-repo-info');
const { version } = require('./package.json');
const { resolve } = require('path');
const { writeFileSync } = require('fs-extra');

const info = getRepoInfo();
const sha = info.abbreviatedSha;
const date = new Date(info.committerDate);

const file = resolve(__dirname, 'projects', 'hop-web', 'src', 'environments', 'version.ts');
writeFileSync(file, `
// AUTO GENERATED! DO NOT MANUALLY EDIT OR CHECKIN!
export const VERSION = '${version}';
export const COMMIT_SHA = '${sha}';
export const COMMIT_DATE = '${date.toLocaleString()}';
`,
  { encoding: 'utf-8' }
);

console.log(`Wrote version info to ${resolve(__dirname, 'projects', 'hop-web', 'src', 'environments', 'version.ts')}`);