const express = require('express');
const reviewController = require('./../controllers/reviewController');
const authController = require('./../controllers/authController');
// we are putting mergeparmas: true cause the createReview from the tourRoutes is handed to this reviewRoute and it needs to use the params like(tour:id)    /:tourId/reviews.
// so if there is a rout like (POST /tour/tourId/reviews) or POST(/reviews) it will be handled here
const router = express.Router({ mergeParams: true });

router
  .route('/')
  .get(reviewController.getAllReviews)
  .post(
    authController.protect,
    authController.restrictTo('user'),
    reviewController.setTourUserIds,
    reviewController.createReview
  );

router
  .route('/:id')
  .get(reviewController.getReview)
  .delete(reviewController.deleteReview)
  .patch(reviewController.updateReview);

module.exports = router;
