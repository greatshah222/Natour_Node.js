const mongoose = require('mongoose');
// here in the required section the required is set to true if it is false it will return the erro ras specified in the second parameter
// the default means it will be set to 4.5 if not specified
const tourSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A tour must have a name'],
    unique: true,
    trim: true,
  },
  duration: {
    type: Number,
    required: [true, 'A tour must have a duration'],
  },
  maxGroupSize: {
    type: Number,
    required: [true, 'A group must have group size'],
  },
  difficulty: {
    type: String,
    required: [true, ' There should be a difficulty level'],
  },

  ratingsAverage: {
    type: Number,
    default: 4.5,
  },

  ratingsQuantity: {
    type: Number,
    default: 0,
  },
  price: {
    type: Number,
    required: [true, 'a tour must have a price'],
  },
  priceDiscount: {
    type: Number,
  },
  // trim removes all the white space from beginning and end
  summary: {
    type: String,
    trim: true,
    required: [true, 'A tour should have a summary'],
  },
  description: {
    type: String,
    trim: true,
  },
  imageCover: {
    // string cause its a name
    type: String,
    required: [true, ' A tour must have a image '],
  },
  // it is an array because it has nr of string
  // date is auto converted
  images: [String],
  createdAt: {
    type: Date,
    default: Date.now(),
    // select = false means it will not be sent as response
    select: false,
  },
  startDates: [Date],
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
