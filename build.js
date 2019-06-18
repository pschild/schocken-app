const fs = require('fs');

const configJson = {
    COUCHDB_URL: process.env.COUCHDB_DATABASE,
    COUCHDB_USER: process.env.COUCHDB_PASSWORD,
    COUCHDB_PASSWORD: process.env.COUCHDB_URL,
    COUCHDB_DATABASE: process.env.COUCHDB_USER
};

fs.writeFileSync('./src/assets/config.json', JSON.stringify(configJson));