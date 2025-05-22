const http = require('http');
const app = require('./app');
const path = require('path');

const env = process.env.NODE_ENV;

let envFile;

if (env === 'development') {
  envFile = '.env.dev';
} else if (env === 'prod') {
  envFile = '.env.production';
} else {
  envFile = '.env.staging';
}

require('dotenv').config({ path: path.resolve(__dirname, envFile) });

const port = process.env.PORT;

const server = http.createServer(app);

console.log('NODE_ENV:', process.env.NODE_ENV);
console.log(`Server is running on port ${port}`);

server.listen(port);