const Review = require('./../models/reviewsModel');
// const catchAsync = require('./../utilis/catchAsync');
const factory = require('./handlerFactory');

// exports.getAllReviews = catchAsync(async (req, res, next) => {
//   // filter is for example if there is id in the params it will show review only for that tour
//   let filter = {};
//   if (req.params.tourId) {
//     filter = { tour: req.params.tourId };
//   }
//   const reviews = await Review.find(filter);
//   res.status(200).json({
//     status: 'Success',
//     results: reviews.length,
//     data: {
//       review: reviews,
//     },
//   });
// });
exports.getAllReviews = factory.getAll(Review);

// we are using this mehid because we need this is create review section but since we are using factory function we have to create this middleware first
exports.setTourUserIds = (req, res, next) => {
  // allow nested routes
  if (!req.body.tour) {
    req.body.tour = req.params.tourId;
  }
  // req.user.id from protect middleware
  if (!req.body.user) {
    req.body.user = req.user.id;
  }
  next();
};

// exports.createReviews = catchAsync(async (req, res, next) => {
//   if (!req.body.tour) {
//     req.body.tour = req.params.tourId;
//   }
//   // req.user.id from protect middleware
//   if (!req.body.user) {
//     req.body.user = req.user.id;
//   }

//   const newReview = await Review.create(req.body);
//   res.status(200).json({
//     status: 'Success',
//     data: {
//       review: newReview,
//     },
//   });
// });
exports.createReview = factory.createOne(Review);
exports.deleteReview = factory.deleteOne(Review);
exports.updateReview = factory.updateOne(Review);
exports.getReview = factory.getOne(Review, { path: 'reviews' });
