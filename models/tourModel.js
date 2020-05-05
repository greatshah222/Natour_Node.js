const slugify = require('slugify');
const mongoose = require('mongoose');
const validator = require('validator');
// for slugs
// here in the required section the required is set to true if it is false it will return the erro ras specified in the second parameter
// the default means it will be set to 4.5 if not specified

// use normal function instead of an arrow function in mongoose cause of its this property
const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      trim: true,
      maxlength: [40, 'A name cannot have more than 40 character'],
      minlength: [10, 'A name must have atleast 10 character'],
      // 3rd party plugin called validator.js
      // not in use now
      // validate: [validator.isAlpha, 'Only alpha charachter allowed'],
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
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'rating must be below or equal 5.0'],
    },

    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    slug: {
      type: String,
    },
    price: {
      type: Number,
      required: [true, 'a tour must have a price'],
    },
    priceDiscount: {
      type: Number,
      // validators, the call back function has the acess to value that was input. validate can return either true or false
      // if price is greater no error
      // in the message the {VALUE} has the access to validator value it is mongoose property
      // this property only works on creation of new document not on update
      validate: {
        validator: function (val) {
          // this works only on CREATION OF NEW DOC NOT ON UPDATE
          return val < this.price;
        },
        message: 'Discount price {VALUE} cannot be bigger than price',
      },
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
    secretTour: {
      type: Boolean,
      default: false,
    },
  },

  // for duration weeks
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);
// virtual properties will npt be saved to data cause we want to save space in db. for example why save km and miles both in db save only one the other one can be derived using the first one. Simillarly we want the duration of tours in week but we dont wat to save in db cause there we already have their in days
// we used normal function because we need this keyword instead of arrow function
// we cannot use virtual property in query be aue technically they are not part of the databse
// now we can edit it to add slugs
tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

// document middleware . There are 4 types of middleware namely document,query,model and aggregate
// MIDDLEWARE can be defined in pre and post of an event
// it runs before only .save() command and.create()
// it will have access to documnet creted by save or create method before saving into database
// there is also next function in mongoose middleware
tourSchema.pre('save', function (next) {
  console.log(
    'from document middleware which is only called whule executing save or create method'
  );
  // this is currently proccessed documents
  // console.log(this);
  this.slug = slugify(this.name, { lower: true });
  next();
});

// multiple pre middleware
tourSchema.pre('save', function (next) {
  console.log('Will save doc from the pre middleware');
  next();
});

// post middleware and it doesnot have access to this variable but instead the document that was just saved so doc in our case
tourSchema.post('save', function (doc, next) {
  console.log(doc);

  next();
});

// query middleware
// it will work before giving the response and this here is query object
// it works in query in find and will process query
// tour is offered to only vip and not to normal customer
// here secret tour is not shown in the response object
// this here is query object
// the problem with this function is it will not be shown in getAllTours but it might be shown in get single tour or update tour when we use other method like findOne. Actually findById is also findOne so we have to carry this operation in all the find method by using regular expression
// this regular expression means all the query starting with find
tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });

  this.start = Date.now();

  next();
});
// after the query has executed
tourSchema.post(/^find/, function (docs, next) {
  console.log(`query took ${Date.now() - this.start}ms`);
  // console.log(docs); it will give all the doc matching the query in pre

  next();
});

// AGGREGATE MIDDLEWARE
// it is easier to hide the secret tour from middleware
// this points to current aggregation object
// this gives Aggregate {
//   _pipeline: [
//     { '$match': [Object] },
//     { '$group': [Object] },
//     { '$sort': [Object] }
//   ],
//   _model: Model { Tour },
//   options: {}
// }
tourSchema.pre('aggregate', function (next) {
  // unhift adds in the first element of the array and aggreggate is array
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
  //console.log(this);
  next();
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
