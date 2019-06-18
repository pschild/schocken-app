const fs = require('fs');

console.log('env?');
console.log(process.env.TOP_SECRET);
// fs.writeFileSync('./.env', `API_KEY=${process.env.API_KEY}\n`)