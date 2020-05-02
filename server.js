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
// here in the required section the required is set to true if it is false it will return the erro ras specified in the second parameter
// the default means it will be set to 4.5 if not specified
const tourSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A tour must have a name'],
    unique: true,
  },
  rating: {
    type: Number,
    default: 4.5,
  },
  price: {
    type: Number,
    required: [true, 'a tour must have a price'],
  },
});
// console.log(process.env.NODE_ENV)
const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`App running on port ${port}`);
});
// uppercase on modelname and variable
const Tour = mongoose.model('Tour', tourSchema);
// testTour is a documented created out of tour model and is an instance of tour model
const testTour = new Tour({
  name: 'The RUnnign Hell',
  rating: 4.7,
  price: 497,
});
testTour
  .save()
  .then((doc) => {
    console.log(doc);
  })
  .catch((err) => {
    console.log('error 🦺', err);
  });
