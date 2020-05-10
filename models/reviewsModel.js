// review /rating/createdAt/ref toTour / ref to user
const mongoose = require('mongoose');

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
    // Both user and tour are the parents of the review and we out it here cause we dont want big array in the parent element. There might be 100s of 1000s of reviews.so use parent refrencing
    // here the review doc knows what tour it belongs to but the tour doesnot know
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
// this will add 2 query which means it will decrease performance
// how are we going to access reviews on the tour cause we did parent refrencing here . The reviews is pointing toward the tour but not tour pointing toward review
// tour doesnot know about review so to solve this problem to do child refrencing on tour but it will grow indefinitly
// so the solution is virtual populate, we can actullay populate the tour with review without keeping the array of id on tour
// tour is being populated with reviews and reviews again gets populated with tour and user and tour is also getting populated with guides. so chain of 3 populates. turn off populating tour with reviews
// conslusion single tour is populating reviews instead of reviews populating tour
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

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
