const editJsonFile = require('edit-json-file');

const packageJsonFile = editJsonFile(`${__dirname}/package.json`);
const versionFromPackageJson = packageJsonFile.get('version');

const buildTime = new Date();

const ngswConfigFile = editJsonFile(`${__dirname}/ngsw-config.json`);
ngswConfigFile.set('appData', {
    version: versionFromPackageJson,
    buildTime
});
ngswConfigFile.save();

const versionFile = editJsonFile(`${__dirname}/src/version.json`);
versionFile.set('version', versionFromPackageJson);
versionFile.set('buildTime', buildTime);
versionFile.save();