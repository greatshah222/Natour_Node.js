// Server
const mongoose = require('mongoose');
// thi smanggose is for connecting our application with the mangodb server in atlas
// this dotenv is for config.env file to read variable from file and store in env variable of node.js
const dotenv = require('dotenv');
// we need to run dotnenv before we run in app file because all goes step by step

// uncalled exception = all error in sync code which are not handled are
// for example console.log(x);
// it will give us an error
// to fix it
// this needs to be on the top of the page before we require our app
process.on('uncaughtException', (err) => {
  console.log(err.name, err.message);
  console.log('UNCAUGHT EXCEPTION! 💣 Shutting Down....');
  process.exit(1);
});

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
const server = app.listen(port, () => {
  console.log(`App running on port ${port}`);
});

// Handling errors for unhandled rejection . For instance we might have a error in our DB per say name or password . We will get an error stating unhandled promises. We can add a catch block even there but lets see how the deal with unhandled rejetion globally in our application.
// so using emitter the first parameter is the name of the emitter and second is the callback function which in our case is err
// The 'unhandledRejection' event is emitted whenever a Promise is rejected and no error handler is attached to the promise within a turn of the event loop.
process.on('unhandledRejection', (err) => {
  // we get bad auth and Authentication failed as our console.log(err.name,err.message)
  console.log(err.name, err.message);
  // shutting down the application
  // code 0 is for success and code 1 is for uncalled exception
  console.log('UNHANDLER REJECTION! 💣 Shutting Down....');
  // we can close the app by using process.exit(1) but it is bad way s o shutting it grace
  // process.exit(1);
  // here we give time to the server to finish its request and then close
  // it is helpful in real-world
  server.close(() => {
    process.exit(1);
  });
});
