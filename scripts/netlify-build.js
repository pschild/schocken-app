const { resolve } = require('path');
const { writeFileSync } = require('fs-extra');

const configJson = {
  REMOTE_URL: process.env.REMOTE_URL,
  REMOTE_USER: process.env.REMOTE_USER,
  REMOTE_PASSWORD: process.env.REMOTE_PASSWORD,
  REMOTE_DATABASE: process.env.REMOTE_DATABASE,
  LOCAL_DATABASE: 'schocken-local-prod'
};

const file = resolve(__dirname, '..', 'projects', 'hop-web', 'src', 'environments', 'db-config.prod.json');
writeFileSync(file, JSON.stringify(configJson), { encoding: 'utf-8' });

console.log(`Wrote db config info to ${resolve(__dirname, '..', 'projects', 'hop-web', 'src', 'environments', 'db-config.prod.json')}`);