const stripe = require('stripe')('sk_test_uFmkMNHfV8c2csoHXQxTPtNi009KQBgvUs');
// check the documentation
const Tour = require('./../models/tourModel');
const AppError = require('./../utilis/appError');
const catchAsync = require('./../utilis/catchAsync');
const factory = require('./handlerFactory');

// https://stripe.com/docs/payments/checkout/customization
exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  // 1) get the currently booked tour
  const tour = await Tour.findById(req.params.tourID);
  // 2 create checkout session(install npm i stripe)
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    // user will be redirected to the url when successed or cancelled.
    // succes redirect to homepage
    success_url: `${req.protocol}://${req.get('host')}/`,
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
