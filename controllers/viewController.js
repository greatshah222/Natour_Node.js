const Tour = require('./../models/tourModel');
const catchAsync = require('./../utilis/catchAsync');
const AppError = require('./../utilis/appError');
const User = require('./../models/usermodel');
const Booking = require('../models/bookingModel');

exports.getOverview = catchAsync(async (req, res, next) => {
  // 1 get all the tour data from the collection
  const tours = await Tour.find();

  // pass tour ddata into the template

  //2 build template

  // 3 render that template using tour date from 1)
  res.status(200).render('overview', {
    title: 'All tours',
    tours: tours,
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  // 1 get all the tour data from the collection

  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review rating user',
  });
  if (!tour) {
    return next(new AppError('No tour found', 404));
  }
  console.log(tour);
  //2 build template

  // 3 render that template using tour date from 1)
  res.status(200).render('tour', {
    title: tour.name,
    tour: tour,
  });
});

exports.getLoginForm = catchAsync(async (req, res, next) => {
  res.status(200).render('login', {
    title: 'Log into your account',
  });
});

exports.getAccount = catchAsync(async (req, res, next) => {
  res.status(200).render('account', {
    title: 'Welcome to your account',
  });
});
// name and email are the name of the body that we have defined in the html form
exports.updateUserData = catchAsync(async (req, res, next) => {
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    {
      name: req.body.name,
      email: req.body.email,
    },
    {
      new: true,
      runValidators: true,
    }
  );
  res.status(200).render('account', {
    title: 'Welcome to your account',
    // we need to pass user: updateduser else it will take old user from protect middleware
    user: updatedUser,
  });
});

exports.getMyTours = catchAsync(async (req, res, next) => {
  // 1) find all bookings
  const bookings = await Booking.find({ user: req.user.id });
  // 2) find tour with returned ids
  // will create an array of tour id as tour is just the tourID
  const tourIDs = bookings.map((el) => el.tour);
  // it will find all the _id in the tourIDs
  const tours = await Tour.find({ _id: { $in: tourIDs } });

  res.status(200).render('overview', {
    title: 'My tours',
    tours: tours,
  });
});
