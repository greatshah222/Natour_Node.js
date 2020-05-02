const express = require('express');
const tourController = require('./../controllers/tourController');

const router = express.Router();
// this middlewar eis for our parameter like in our case id
// here this middleware also holds the 4th parameter called val which holds the value of id . and remember this middleware is for only tour not user cause this is specified on this page
// router.param('id', tourController.checkID);
// create a check body middleware function

router
  .route('/')
  .get(tourController.getAllTours)
  .post(tourController.createTour);

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(tourController.deleteTour);

module.exports = router;
