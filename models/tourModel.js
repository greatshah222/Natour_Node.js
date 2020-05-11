const slugify = require('slugify');
const mongoose = require('mongoose');
const validator = require('validator');
const User = require('./usermodel');
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
      // set is callled each time a value is set to this function
      set: (val) => Math.round(val * 10) / 10, // 4.666 to 5  but we want 4.7 so val*10 /10
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
    // geojson to specify geospatial data
    // object will be an embedded object that is why we are specifying it differently than above which are basicaaly Schema
    startLocation: {
      // mangoDb supports geospatial data out of the box
      // geospatial data means specifying location using latitude and longitude
      // dont do startLocation:{type:string}
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
        // we can also define other geometry like polygon,lines etc instead of point
        // but use point it is easy
      },
      // we need array of coordinates which is longitude first and then latitude
      // usually it is other way around for example in google map it will be first latitude and then longitude
      coordinates: [Number],
      address: String,
      description: String,
    },
    // now we are creating embedded document. We are specifying an array of object which will create a brand new document inside the parent document.
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    // we are trying to embed guides(user) and tour so we are creating an array of user id which will be saved here
    // guides: Array,// use this in embedded method
    // the idea is that tours and user will remain completely seperate entity so we just want to save the user id instead of whole user what we were doing in the embedded method in our commented middleware below. WHen we query the tour we want to automatically get the access to the tour guides without being saved on the tour document itself and that is called refrencing
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        /*
 we even dont need to import the User model to use this one. It will be saved like this
        "guides": [
          "5eb56dee3109916fd353f8dc",
          "5eb56df53109916fd353f8dd"
      ],
      */
      },
    ],
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
// u cant query virtual since they are not saved to Db
tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

/**
 Virtual Property we are adding the review as a virtual property to tour model 
 */
// .virtual(name of virtual field eg here is review) then object of options
// foreignField: tour is the foreign field and it is saved in this name
// localField:and id is localfield since it matches foreignField
//  Mongoose will populate documents from the model in ref whose foreignField matches this document's localField
// populate only in single tour but not on allTour page
tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id',
});

// creating index so that the db does not have to browse through all the document to give the index
// example if we want fields of rating of 4 it has to search through all the document. but if we have index it will have to search through only index. The reason findById is fast and relevant beacause it has its own index. You can check index in mongoDB compass.
// for example we are settting the index field on price in our this app
// price:1 means in ascending order wheras -1 in descending order
// this will reduce the number of document examined
//tourSchema.index({ price: 1 });
// compund index when user query for 2 fields at sametime
// there is a huge benifit of using index so try to use the index in any application
tourSchema.index({ price: 1, ratingsAverage: -1 });
tourSchema.index({ slug: 1 });
// for geospitial index should be 2d plane
tourSchema.index({ startLocation: '2dsphere' });

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
// embedding user id(guides) to tour
// mao will put it in guides array and this guides array is full of promises and we need to run this promises
// we are using promise.all cause guidesPromises is an array of promise
// this is just an example of using embedding and this might be bad for our application in this context cause if the user role is changed than we have to update even in the tour collection so we will be using reference way or normalized may
// tourSchema.pre('save', async function (next) {
//   const guidesPromises = this.guides.map(async (id) => await User.findById(id));
//   this.guides = await Promise.all(guidesPromises);
//   next();
// });

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
// tour.findById is like Tour.findOne({_id:req.params.id})
// we want to fill up this model with guides actual data.It will be in the query but not in the actual DB
// here .populate(what field) will add the whole object not just what is specified in Db
/**
   It will add this 

  {
                    "role": "user",
                    "passwordChangedAt": "2020-05-08T14:33:30.204Z",
                    "_id": "5eb56dee3109916fd353f8dc",
                    "name": "bishal shah",
                    "email": "test2@mail.com",
                    "__v": 0
                },
                instead of "5eb56dee3109916fd353f8dc"f
   */
// here in the populate path means name and we want to remove the property of (passwordChangedAt and __v so select as minus)
// populates create new query so it may decrease perfomance so remember to use only in small application
// we have to add this populate in other query as well so it is good idea to put it in query middleware
tourSchema.pre(/^find/, function (next) {
  // it will populate
  this.find().populate({
    path: 'guides',
    select: '-__v -passwordChangedAt',
  });
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
// we have to remove this middleware because of geospatial aggregate which needs to be first stage of aggregate
// tourSchema.pre('aggregate', function (next) {
//   // unhift adds in the first element of the array and aggreggate is array
//   this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
//   console.log(this);
//   next();
// });
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
