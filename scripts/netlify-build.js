const { resolve } = require('path');
const { writeFileSync } = require('fs-extra');

const configJson = {
  REMOTE_URL: process.env.REMOTE_URL,
  REMOTE_USER: process.env.REMOTE_USER,
  REMOTE_PASSWORD: process.env.REMOTE_PASSWORD,
  REMOTE_DATABASE: process.env.REMOTE_DATABASE,
  LOCAL_DATABASE: process.env.LOCAL_DATABASE,
  SENTRY_URL: process.env.SENTRY_URL,
  ROLLBAR_ACCESS_TOKEN: process.env.ROLLBAR_ACCESS_TOKEN
};

const file = resolve(__dirname, '..', 'projects', 'hop-web', 'src', 'environments', 'env.prod.json');
writeFileSync(file, JSON.stringify(configJson), { encoding: 'utf-8' });

console.log(`Wrote db config info to ${resolve(__dirname, '..', 'projects', 'hop-web', 'src', 'environments', 'env.prod.json')}`);