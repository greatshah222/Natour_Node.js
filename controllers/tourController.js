const Tour = require('./../models/tourModel');

// const tours = JSON.parse(
//   fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
// );
// this is param middleware
// exports.checkID = (req, res, next, val) => {
//   console.log(`tour id is ${val}`);
//   if (req.params.id * 1 > tours.length) {
//     return res.status(401).json({
//       status: 'fail',
//       message: 'invalid TOur id',
//     });
//   }
//   next();
// };
// this middleware is for checkinf isf the response body has both name and price in our response
// exports.checkBody = (req, res, next) => {
//   if (!req.body.name || !req.body.price) {
//     return res.status(404).json({
//       status: 'fail',
//       message: 'Missing either name or price.',
//     });
//   }
//   next();
// };

exports.getAllTours = async (req, res) => {
  // as mongodb use the same find and find method returns an array
  try {
    const tours = await Tour.find();

    res.status(200).json({
      status: 'sucess',
      results: tours.length,
      data: {
        tours: tours,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: 'something went wrong',
    });
  }
};

exports.getTour = async (req, res) => {
  // we can get our parameter of request id using req.params
  // console.log(req.params);
  // // convert string to num
  // const id = req.params.id * 1;
  // const tour = tours.find((el) => el.id === id);
  // res.status(200).json({
  //   status: 'success',
  //   data: {
  //     tour: tour,
  //   },
  // });
  try {
    // tour.findById is like Tour.findOne({_id:req.params.id})
    const tour = await Tour.findById(req.params.id);
    res.status(200).json({
      status: 'success',
      data: {
        tour: tour,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: 'something went wrong',
    });
  }
};
exports.createTour = async (req, res) => {
  try {
    const newTour = await Tour.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        tour: newTour,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: 'Invalid data set',
    });
  }
};

exports.updateTour = async (req, res) => {
  // here in the findByIDandupate the first parameter is the is so we find the single tour then update its body by using req.body
  // new: true means it will return an updated value
  // runValidators checks for validation set in the tourschema
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({
      status: 'succees',
      data: {
        tour: tour,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: 'Invalid data set',
    });
  }
};

exports.deleteTour = async (req, res) => {
  res.status(204).json({
    status: 'success',
    data: null,
  });
};
