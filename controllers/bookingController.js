const stripe = require('stripe')('sk_test_uFmkMNHfV8c2csoHXQxTPtNi009KQBgvUs');
// check the documentation
const Tour = require('../models/tourModel');
const AppError = require('../utilis/appError');
const catchAsync = require('../utilis/catchAsync');
const factory = require('./handlerFactory');
const Booking = require('../models/bookingModel');

// https://stripe.com/docs/payments/checkout/customization
exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  // 1) get the currently booked tour
  const tour = await Tour.findById(req.params.tourID);
  // 2 create checkout session(install npm i stripe)
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    // user will be redirected to the url when successed or cancelled.
    // succes redirect to homepage
    // this succes url is not secure cause we are adding details to it
    success_url: `${req.protocol}://${req.get('host')}/?tour=${
      req.params.tourID
    }&user=${req.user.id}&price=${tour.price}`,
    cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
    customer_email: req.user.email,
    // client refrence_id allows us to pass some data abt the session that we are currently creating
    client_reference_id: req.params.tourID,
    line_items: [
      {
        name: `${tour.name} Tour`,
        description: tour.summary,
        // image need to be live images(deployed website) so taking it from natours. images are in array
        images: [`https://www.natours.dev/img/tours/${tour.imageCover}`],
        // need to be in cents so *100
        amount: tour.price * 100,
        currency: 'eur',
        quantity: 1,
      },
    ],
  });

  // 3) create session as response
  res.status(200).json({
    status: 'success',
    session,
  });
});

exports.createBookingCheckout = catchAsync(async (req, res, next) => {
  // this is temporary cause it is unsecure.everyone can make booking without paying
  // getting data from our query string

  /**
   
  


  success_url: `${req.protocol}://${req.get('host')}/?tour=${
      req.params.tourID
    }&user=${req.user.id}&price=${tour.price}`,
    cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`
   */
  const { tour, user, price } = req.query;
  if (!tour && !user && !price) {
    // in the / routes we have this middleware so when there is not any of them it will simply go to next midddlware
    /**
     * 
     * router.get(
  '/',
  bookingController.createBookingCheckout,
  authController.isLoggedIn,
  viewController.getOverview
);
     * 
     * 
     */
    return next();
  }
  await Booking.create({ tour, user, price });
  // now in the query string we have all the info like tour name and user id and the price as well so removing it. redirect will hit another request to / but here we dont have price or anything so it will just give us the home page
  res.redirect(req.originalUrl.split('?')[0]);
  next();
});

exports.getBooking = factory.getOne(Booking);
exports.getAllBooking = factory.getAll(Booking);
// only for admin to create/update/delete Booking using this route
// validation might not work and pwd update not possible
exports.updateBooking = factory.updateOne(Booking);
exports.deleteBooking = factory.deleteOne(Booking);
exports.createBooking = factory.createOne(Booking);
