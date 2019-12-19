const fs = require('fs');

const configJson = {
  REMOTE_URL: process.env.REMOTE_URL,
  REMOTE_USER: process.env.REMOTE_USER,
  REMOTE_PASSWORD: process.env.REMOTE_PASSWORD,
  REMOTE_DATABASE: process.env.REMOTE_DATABASE,
  LOCAL_DATABASE: 'schocken-local-prod'
};

fs.writeFileSync('./src/environments/db-config.prod.json', JSON.stringify(configJson));