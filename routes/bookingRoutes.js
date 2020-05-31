const express = require('express');
const bookingController = require('./../controllers/bookingController');
const authController = require('./../controllers/authController');

const router = express.Router();
// send also the tourID
router.get(
  '/checkout-session/:tourID',
  authController.protect,
  bookingController.getCheckoutSession
);

router
  .route('/')
  .get(authController.protect, bookingController.getAllBooking)
  .post(authController.protect, bookingController.createBooking);
router
  .route('/:id')
  .get(authController.protect, bookingController.getBooking)
  .delete(authController.protect, bookingController.deleteBooking)
  .patch(authController.protect, bookingController.updateBooking);
module.exports = router;
