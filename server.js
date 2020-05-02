// Server
const mongoose = require('mongoose');
// thi smanggose is for connecting our application with the mangodb server in atlas
// this dotenv is for config.env file to read variable from file and store in env variable of node.js
const dotenv = require('dotenv');
// we need to run dotnenv before we run in app file because all goes step by step
dotenv.config({ path: './config.env' });
const app = require('./app');

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => {
    // console.log(con.connections);
    // put con in then to get con.connections result
    console.log('db connected');
  });

// console.log(process.env.NODE_ENV)
const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`App running on port ${port}`);
});
