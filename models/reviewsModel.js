// review /rating/createdAt/ref toTour / ref to user
const mongoose = require('mongoose');
const Tour = require('./tourModel');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Review Cannot be Empty'],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    // review belongs to the tour and it also has its user
    // Both user and tour are the parents of the review and we put it here cause we dont want big array in the parent element. There might be 100s of 1000s of reviews.so use parent refrencing
    // here the review doc knows what tour it belongs to but the tour doesnot know
    // we did parent refrencing here because we dont know how much the array will grow but in the guides we did child refrencing because we know 1 tour cannot have many(like 100s ) of guide
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'A review must belong to a tour'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'A review must belong to an user'],
    },
  },
  // these are virtual property and it nmeans that are not stored in Db but are required fro calculation . for example remember in the tour model we calculated the days in week.Virtuals is true means whenever there is an output it will show the virtual property
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);
// one user can only post 1 review in that tour so making that tour and id unique altogether not seperately
reviewSchema.index({ tour: 1, user: 1 }, { unique: true });
// this will add 2 query which means it will decrease performance
// how are we going to access reviews on the tour cause we did parent refrencing here . The reviews is pointing toward the tour but not tour pointing toward review
// tour doesnot know about review so to solve this problem to do child refrencing on tour but it will grow indefinitly
// so the solution is virtual populate, we can actullay populate the tour with review without keeping the array of id on tour
// tour is being populated with reviews and reviews again gets populated with tour and user and tour is also getting populated with guides. so chain of 3 populates. turn off populating tour with reviews
// conslusion single tour is populating reviews instead of reviews populating tour
// we have to remove one of the populate cause the tour is being populated with review and review is again being populated with tour and user
reviewSchema.pre(/^find/, function (next) {
  this.find()
    // .populate({
    //   path: 'tour',
    //   select: 'name',
    // })
    .populate({
      path: 'user',
      select: 'name photo',
      // dont leak private data of user so only name and photo
    });
  next();
});

// static method can be called on model directly instead of any instances of model
// modelname.statics.nameofMethod
// this keyword pionts to the current model
// aggregate needs to be callled directly onmodel that is ahy we are using statics mehod on first place .pass array of stages in aggregate
reviewSchema.statics.calcAverageRatings = async function (tourId) {
  //console.log(tourId);
  const stats = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        // we are grouping tour by tour
        _id: '$tour',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);
  //console.log(stats);
  // saving to db
  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      // since stats are stored in array in inside there is object so stats[0]
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating,
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      // since stats are stored in array in inside there is object so stats[0]
      ratingsQuantity: 0,
      ratingsAverage: 4.5,
    });
  }
};
// the calcAverageRatings will be called each time there is a new review
// use post cause it might not be saved in db if we use pre
// post middleware doesnot have access to next
// this function runs on save but not on update and delete
// calling the calculateAverage on save

reviewSchema.post('save', function () {
  // this points to current review
  // since the above function is available on model
  // the problem here is Review is not yet defined so we gave to use this.constructor insteaad of Review
  //  Review.calcAverageRatings(this.tour);
  this.constructor.calcAverageRatings(this.tour);
});
// findOneand update and Findoneand delete is a query middleware and there is no document middleware and we dont have access to query at this point of time
// we have to get access to current review from where we can extract tourId and then calculate the statistics
// this keyword points to current query but we want to access the current review documwent. that is why we have to access the document by executin query so findOne
// this findOne gets the data from db before it was saved so old data but here we just need id.we cannot execute  calcAverageRatings here cause it will be for old data.we have to use the post to modify and persist the data but if we use post we cannot execute in the first place so run two middleware and pass the data from pre to post using this.r(r can be named anything)
// for update and delete
reviewSchema.pre(/^findOneAnd/, async function (next) {
  // to pass this data to the post middleware we have to create a property called this so this.r
  //console.log(this);
  this.r = await this.findOne();
  //console.log(this.r);
  next();
});
// now we can use post in the above middleware
reviewSchema.post(/^findOneAnd/, async function () {
  // this.r gives the review so this.r.tour
  // we have to call this static method in the Model so point to this.r.constructor
  // this.r = await this.findOne(); does not work here cause the query was already executed

  await this.r.constructor.calcAverageRatings(this.r.tour);
});
const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
