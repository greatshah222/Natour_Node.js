const Tour = require('./../models/tourModel');
const APIFeatures = require('./../utilis/apiFeature');
// for top-five-tours
exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5'; // cause the req is string
  req.query.sort = '-ratingsAverage,price';
  // include a and b, exclude other fields
  //query.select('a b');
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};
// for top 10 cheapest tours this is for practise
exports.cheapestTour = (req, res, next) => {
  req.query.limit = '8';
  req.query.sort = 'price,ratingsAverage';
  req.query.fields = 'name,price,difficulty,summary';

  next();
};
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

// queryString means req.query which we get from route(express)

exports.getAllTours = async (req, res) => {
  // as mongodb use the same find and find method returns an array
  try {
    console.log(req.query);
    // 1st  way of finding byquery just like in the mangoDb
    // const query = await Tour.find({
    //   duration: 5,
    //   difficulty: 'easy',
    // });
    // 2nd way of finding by query

    // const query = await Tour.find()
    //   .where('duration')
    //   .equals(5)
    //   .where('difficulty')
    //   .equals('easy');
    // here we are finding in terms of query provided by request
    // here we are using spread operator because it creates the copy of res.query and if we donot we might change the query
    // build query
    // filtering
    // const queryObj = { ...req.query };
    // // we are adding excluded fields so that they willl be remove from query because we need them to handle their own function like pagination, sorting and other
    // const excludedFields = ['page', 'sort', 'limit', 'fields'];
    // excludedFields.forEach((el) => delete queryObj[el]);
    // // so instead of req.query we are using queryObj so that the key can be excluded from excluded fields

    // // advanced filtering
    // // first changing the object to string
    // let queryStr = JSON.stringify(queryObj);
    // now match 4 words like gte,gt,lte,lt here /b matches the exact 4 words
    // queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    // console.log(JSON.parse(queryStr));

    // {duration:{$gte:5}} in mangoDb
    // in express we can get it by duration[gte]=5 and the result will be
    //{ duration: { gte: '5' } } so only missing dollar sign($)

    // we cannot put await function in the const tours = await TOur.find(queryObj) cause it will come back with the result i.e that tour and we cannot later chain our page or sort method so the easiest way is to change the name and put it query and later await it
    // let query = Tour.find(JSON.parse(queryStr));

    // sorting else is for if the user dosenot write any sort type it will be done by created at and minus sign is for descending

    // if (req.query.sort) {
    //   query = query.sort(req.query.sort);
    // } else {
    //   query = query.sort('-createdAt');
    // }

    //console.log(req.query, queryObj);

    // field limiting also called projection like only name,duration.price etc
    // field limiting exaple in postman type this url
    // http://127.0.0.1:8000/api/v1/tours/?fields=name,duration

    // include a and b, exclude other fields query.select('a b');
    // if (req.query.fields) {
    //   // we use split because in the url these fields are seprated by comma and they needs to be removed so split by comma and then join by spaces
    //   const fields = req.query.fields.split(',').join(' ');
    //   console.log(fields);
    //   query = query.select(fields);
    // } else {
    //   // minus means excluding we have one filed property with "__v": 0 so removing it if the user doesnot specify anything
    //   query = query.select('-__v');
    // }

    // PAGINATION
    // skip means skip how many query so to get page 2 from 1  we need to skip 10
    // const page = req.query.page * 1 || 1; // to convert to num
    // const limit = req.query.limit * 1 || 20;
    // const skip = (page - 1) * limit;
    // query = query.skip(skip).limit(limit);
    // if (req.query.page) {
    //   // count the nr of doc in tour
    //   const numTours = await Tour.countDocuments();
    //   if (skip >= numTours) throw new Error('This page doesnot exist');
    // }

    // execute query
    const features = new APIFeatures(Tour.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    const tours = await features.query;
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
      err: err,
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
  try {
    await Tour.findByIdAndRemove(req.params.id);
    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: 'Invalid data set',
    });
  }
};
