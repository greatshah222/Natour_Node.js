const mongoose = require('mongoose');
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
// To use our schema definition, we need to convert our tourSchema into a Model we can work with. To do so, we pass it into mongoose.model(modelName, schema):
// uppercase on modelname and variable
const Tour = mongoose.model('Tour', tourSchema);
// testTour is a documented created out of tour model and is an instance of tour model
// const testTour = new Tour({
//   name: 'The RUnnign Hell',
//   rating: 4.7,
//   price: 497,
// });
// testTour
//   .save()
//   .then((doc) => {
//     console.log(doc);
//   })
//   .catch((err) => {
//     console.log('error 🦺', err);
//   });

module.exports = Tour;
