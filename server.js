// Server
// this dotenv is for config.env file to read variable from file and store in env variable of node.js
const dotenv = require('dotenv');
// we need to run dotnenv before we run in app file because all goes step by step
dotenv.config({ path: './config.env' });
const app = require('./app');

// console.log(process.env.NODE_ENV)
const port = 4000;
app.listen(port, () => {
  console.log(`App running on port ${port}`);
});
module.exports = process.env.PORT || port;
