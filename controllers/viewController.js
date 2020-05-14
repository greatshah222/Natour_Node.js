const Tour = require('./../models/tourModel');
const catchAsync = require('./../utilis/catchAsync');

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

  const tour = await await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review rating user',
  });
  console.log(tour);
  //2 build template

  // 3 render that template using tour date from 1)
  res.status(200).render('tour', {
    title: 'All tours',
    tour: tour,
  });
});
