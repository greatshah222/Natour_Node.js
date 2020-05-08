const express = require('express');
const tourController = require('./../controllers/tourController');
const authController = require('./../controllers/authController');

const router = express.Router();
// this middlewar eis for our parameter like in our case id
// here this middleware also holds the 4th parameter called val which holds the value of id . and remember this middleware is for only tour not user cause this is specified on this page
// router.param('id', tourController.checkID);
// create a check body middleware function

// for best and cheapest tour route so run a middleware function first ao we can use the same callback function
router
  .route('/top-5-cheap')
  .get(tourController.aliasTopTours, tourController.getAllTours);
router
  .route('/cheapest-tour')
  .get(tourController.cheapestTour, tourController.getAllTours);

router.route('/tour-stats').get(tourController.getTourStats);
router.route('/monthly-plan/:year').get(tourController.getMonthlyPlan);
router
  .route('/')
  .get(authController.protect, tourController.getAllTours)
  .post(tourController.createTour);

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.deleteTour
  );

module.exports = router;
