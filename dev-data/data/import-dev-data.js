const fs = require('fs');
const mongoose = require('mongoose');

const dotenv = require('dotenv');

dotenv.config({ path: './config.env' });
const Tour = require('./../../models/tourModel');

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
    console.log('db  connected for importing or deleting files');
  });
const tour = JSON.parse(
  fs.readFileSync(`${__dirname}/tours-simple.json`, 'utf-8')
);
const importData = async () => {
  try {
    await Tour.create(tour);
    console.log('database imported succesfully');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};
const deleteData = async () => {
  try {
    await Tour.deleteMany();
    console.log('database deleted succesfully');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

// process.argv stores in the array the path of where the node is installed and the path to the filename of dev-data/data/import-dev-data.js
// to delete data navigate to
// node dev-data/data/import-dev-data.js --delete

// to import data navigate to
// node dev-data/data/import-dev-data.js --import
if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}
console.log(process.argv);
