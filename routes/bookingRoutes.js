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
module.exports = router;
