const Review = require('./../models/reviewsModel');
const catchAsync = require('./../utilis/catchAsync');
const AppError = require('./../utilis/appError');

exports.getAllReviews = catchAsync(async (req, res, next) => {
  const reviews = await Review.find();
  res.status(200).json({
    status: 'Success',
    results: reviews.length,
    data: {
      review: reviews,
    },
  });
});

exports.createReviews = catchAsync(async (req, res, next) => {
  const newReview = await Review.create(req.body);
  res.status(200).json({
    status: 'Success',
    data: {
      review: newReview,
    },
  });
});
