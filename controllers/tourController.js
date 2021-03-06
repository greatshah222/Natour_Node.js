const multer = require('multer');
const sharp = require('sharp');
const Tour = require('./../models/tourModel');
const APIFeatures = require('./../utilis/apiFeature');
const AppError = require('./../utilis/appError');
const catchAsync = require('./../utilis/catchAsync');
const factory = require('./handlerFactory');

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('not an image.please upload an image', 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});
//.fields cause we have multiple image
// upload.single('image'); only single image req.file
// upload.array('images', 5);  req.files multiple image but same field
// req.files upload.fields([
//   { name: 'imageCover', maxCount: 1 },
//   { name: 'images', maxCount: 3 },
// ]); mix fields
exports.uploadTourImages = upload.fields([
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 3 },
]);

// process the image
exports.resizeTourImages = catchAsync(async (req, res, next) => {
  // req.files if we have more than 1 file
  if (!req.files.imageCover || !req.files.images) {
    return next();
  }
  console.log(req.files);
  // 1 process cover images
  const imageCoverFilename = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;
  await sharp(req.files.imageCover[0].buffer)
    .resize(2000, 1333)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/tours/${imageCoverFilename}`);
  // we are updating the whole req.body in tour update function so it can be passed as req.body.imageCover. save only filename in db
  req.body.imageCover = imageCoverFilename;
  // 2) other images
  // since the images is an array
  // we need to push filename into the array so
  req.body.images = [];
  // here async is only in the callback of only 1 foreach loop which will not stop the process from going down so we have to use map mehtod which gives the array and then use promise.all
  await Promise.all(
    req.files.images.map(async (fileRandomName, i) => {
      const filename = `tour-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;
      await sharp(fileRandomName.buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/tours/${filename}`);
      req.body.images.push(filename);
    })
  );
  console.log(req.body);
  next();
});

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

// exports.getAllTours = catchAsync(async (req, res, next) => {
//   // as mongodb use the same find and find method returns an array

//   //console.log(req.query);
//   // 1st  way of finding byquery just like in the mangoDb
//   // const query = await Tour.find({
//   //   duration: 5,
//   //   difficulty: 'easy',
//   // });
//   // 2nd way of finding by query

//   // const query = await Tour.find()
//   //   .where('duration')
//   //   .equals(5)
//   //   .where('difficulty')
//   //   .equals('easy');
//   // here we are finding in terms of query provided by request
//   // here we are using spread operator because it creates the copy of res.query and if we donot we might change the query
//   // build query
//   // filtering
//   // const queryObj = { ...req.query };
//   // // we are adding excluded fields so that they willl be remove from query because we need them to handle their own function like pagination, sorting and other
//   // const excludedFields = ['page', 'sort', 'limit', 'fields'];
//   // excludedFields.forEach((el) => delete queryObj[el]);
//   // // so instead of req.query we are using queryObj so that the key can be excluded from excluded fields

//   // // advanced filtering
//   // // first changing the object to string
//   // let queryStr = JSON.stringify(queryObj);
//   // now match 4 words like gte,gt,lte,lt here /b matches the exact 4 words
//   // queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
//   // console.log(JSON.parse(queryStr));

//   // {duration:{$gte:5}} in mangoDb
//   // in express we can get it by duration[gte]=5 and the result will be
//   //{ duration: { gte: '5' } } so only missing dollar sign($)

//   // we cannot put await function in the const tours = await TOur.find(queryObj) cause it will come back with the result i.e that tour and we cannot later chain our page or sort method so the easiest way is to change the name and put it query and later await it
//   // let query = Tour.find(JSON.parse(queryStr));

//   // sorting else is for if the user dosenot write any sort type it will be done by created at and minus sign is for descending

//   // if (req.query.sort) {
//   //   query = query.sort(req.query.sort);
//   // } else {
//   //   query = query.sort('-createdAt');
//   // }

//   //console.log(req.query, queryObj);

//   // field limiting also called projection like only name,duration.price etc
//   // field limiting exaple in postman type this url
//   // http://127.0.0.1:8000/api/v1/tours/?fields=name,duration

//   // include a and b, exclude other fields query.select('a b');
//   // if (req.query.fields) {
//   //   // we use split because in the url these fields are seprated by comma and they needs to be removed so split by comma and then join by spaces
//   //   const fields = req.query.fields.split(',').join(' ');
//   //   console.log(fields);
//   //   query = query.select(fields);
//   // } else {
//   //   // minus means excluding we have one filed property with "__v": 0 so removing it if the user doesnot specify anything
//   //   query = query.select('-__v');
//   // }

//   // PAGINATION
//   // skip means skip how many query so to get page 2 from 1  we need to skip 10
//   // const page = req.query.page * 1 || 1; // to convert to num
//   // const limit = req.query.limit * 1 || 20;
//   // const skip = (page - 1) * limit;
//   // query = query.skip(skip).limit(limit);
//   // if (req.query.page) {
//   //   // count the nr of doc in tour
//   //   const numTours = await Tour.countDocuments();
//   //   if (skip >= numTours) throw new Error('This page doesnot exist');
//   // }

//   // execute query
//   const features = new APIFeatures(Tour.find(), req.query)
//     .filter()
//     .sort()
//     .limitFields()
//     .paginate();
//   const tours = await features.query;
//   res.status(200).json({
//     status: 'sucess',
//     results: tours.length,
//     data: {
//       tours: tours,
//     },
//   });
// });
exports.getAllTours = factory.getAll(Tour);
// we only want to populate our review in single tour not on allTour
// exports.getTour = catchAsync(async (req, res, next) => {
//   // we can get our parameter of request id using req.params
//   // console.log(req.params);
//   // // convert string to num
//   // const id = req.params.id * 1;
//   // const tour = tours.find((el) => el.id === id);
//   // res.status(200).json({
//   //   status: 'success',
//   //   data: {
//   //     tour: tour,
//   //   },
//   // });
//   // since we are using the virtual property to populate review we should write the name defined in the virtual property which is reviews
//   const tour = await Tour.findById(req.params.id).populate('reviews');
//   if (!tour) {
//     return next(
//       new AppError(`No tour Found With that Id number ${req.params.id}`, 404)
//     );
//   }
//   res.status(200).json({
//     status: 'success',
//     data: {
//       tour: tour,
//     },
//   });
// });
exports.getTour = factory.getOne(Tour, { path: 'reviews' });

// we have wrapped async function inside the catchAsync Function so this function will be called automatically by catchAsync cause remember it looks like catchAsync(fn). so it will be handled before the express calls it when someone access the route and that is the problem here. here createTour should be a function but not a result of calling the function
// to overcome this problem we have to return  function inside the  catchAsync function which will be assigned to create tour
// exports.createTour = catchAsync(async (req, res, next) => {
//   const newTour = await Tour.create(req.body);

//   res.status(201).json({
//     status: 'success',
//     data: {
//       tour: newTour,
//     },
//   });
//   // try {
//   // } catch (err) {
//   //   res.status(400).json({
//   //     status: 'fail',
//   //     err: err,
//   //   });
//   // }
// });
exports.createTour = factory.createOne(Tour);
// u can use catchAsync function here to remove try -catch but i am putting here for references
// exports.updateTour = async (req, res, next) => {
//   // here in the findByIDandupate the first parameter is the is so we find the single tour then update its body by using req.body
//   // new: true means it will return an updated value
//   // runValidators checks for validation set in the tourschema
//   try {
//     const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
//       new: true,
//       runValidators: true,
//     });
//     if (!tour) {
//       return next(
//         new AppError(`No tour Found With that Id number ${req.params.id}`, 404)
//       );
//     }
//     res.status(200).json({
//       status: 'succees',
//       data: {
//         tour: tour,
//       },
//     });
//   } catch (err) {
//     res.status(404).json({
//       status: 'fail',
//       err: err,
//     });
//   }
// };
exports.updateTour = factory.updateOne(Tour);
exports.deleteTour = factory.deleteOne(Tour);
// exports.deleteTour = catchAsync(async (req, res, next) => {
//   const tour = await Tour.findByIdAndRemove(req.params.id);
//   if (!tour) {
//     return next(
//       new AppError(`No tour Found With that Id number ${req.params.id}`, 404)
//     );
//   }
//   res.status(204).json({
//     status: 'success',
//     data: null,
//   });
// });
exports.getTourStats = async (req, res) => {
  try {
    // agrregate is mongoDb feature but can be accessed in mongoose. We pass the array of stages inside aggregate to manipulate data. Doc passes through this stages
    // match is to select or filter
    // group using accumulator
    const stats = await Tour.aggregate([
      {
        $match: { ratingsAverage: { $gte: 4 } },
      },
      // the pipeline goes through each and every document in database so for numTOurs wee add 1 so it will keep on increasing auto with the nr of document in the collection
      {
        $group: {
          //_id: '$ratingsAverage',
          _id: '$difficulty',
          //_id:'null',
          avgRating: { $avg: '$ratingsAverage' },
          numTours: { $sum: 1 },
          numRatings: { $sum: '$ratingsQuantity' },
          avgPrice: { $avg: '$price' },
          minprice: { $min: '$price' },
          maxprice: { $max: '$price' },
          totalPrice: { $sum: '$price' },
        },
      },
      // here in the sort u need to use the name used to define in the $group and this is sorting will be done in the above €group document.
      // here 1 is for ascendong and -1 is for descending
      { $sort: { avgPrice: -1 } },
      // { $sort: { avgPrice: 1 } },
      // {
      //   $match: {
      //     // ne is not equal to
      //     // here id will be whatever u defined in the $group id up in our case it will be difficulty
      //     _id: { $ne: 'easy' },
      //   },
      // },
    ]);
    res.status(200).json({
      status: 'success',
      data: {
        stats: stats,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: 'Invalid data set',
    });
  }
};
// unwind breaks the document based on their input forexample we have 1 tour with 3 startdates in an array  and after unwind it will have 1 tour with 1 startdate and other startdate with the same tour below the first tour with only one startdate and not in array but as a string like name and duration property
exports.getMonthlyPlan = async (req, res) => {
  try {
    const year = req.params.year * 1;
    const plan = await Tour.aggregate([
      {
        $unwind: '$startDates',
      },
      {
        $match: {
          startDates: {
            $gte: new Date(`${year}-01-31`),
            $lte: new Date(`${year}-12-31`),
          },
        },
      },
      {
        $group: {
          // we want to group them by month but we have all month year date and time so using handy date operator called month
          // here we want to add number of tour in each month
          _id: { $month: '$startDates' },
          numTourStarts: { $sum: 1 },
          // which tour so pushing name to array
          tours: { $push: '$name' },
        },
      },
      // to change the _id to month we use addField
      // here the field name with $_id is changed to month
      {
        $addFields: { month: '$_id' },
      },
      // here the changed name is also added in the field but is not removed to remove change the $project and its value to 0 it is like opacity 1 is visible
      {
        $project: {
          _id: 0,
        },
      },
      {
        $sort: { numTourStarts: -1 },
      },
      // for practise{ $limit: 6 },
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        plan: plan,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      err: err,
    });
  }
};

// router.route(
//   '/tours-within/:distance/center/:latlng/unit/:unit',
//   tourController.getToursWithin
// );
// /tours-within/233/center/-40,56/unit/km
// {startLocation: {$geoWithin: { $centerSphere: [ [ -116.44538956715195, 37.025387343264356 ], 0.03225569902294346 ]}}}
exports.getToursWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  // now we cag letlng now again getting them seperately
  const [lat, lng] = latlng.split(',');
  // radius is radian which is accepted by mongoDb so converting it
  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;
  if (!lat || !lng) {
    return next(new AppError('Please provide latitude and longitude', 400));
  }
  // instead of using math operator like startLocation: {$gt=200}
  // we use geoSpatial operator $geoWithin
  // lng first and then lat in geoJson
  //  geoWithin Selects documents with geospatial data that exists entirely within a specified shape.
  //To specify a GeoJSON polygons or multipolygons using the default coordinate reference system (CRS), use the following syntax:
  /**
   
{
   <location field>: {
      $geoWithin: {
         $geometry: {
            type: <"Polygon" or "MultiPolygon"> ,
            coordinates: [ <coordinates> ]
         }
      }
   }
}
  */
  // The available shape operators are:

  // $box,
  // $polygon,
  // $center (defines a circle), and
  // $centerSphere (defines a circle on a sphere).

  const tours = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });
  console.log(distance, lat, lng, unit);
  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      data: tours,
    },
  });
});
// how far is the tour from your place
exports.getDistances = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;
  // now we cag letlng now again getting them seperately
  const [lat, lng] = latlng.split(',');
  const multiplier = unit === 'mi' ? 0.000621371 : 0.001;

  if (!lat || !lng) {
    return next(new AppError('Please provide latitude and longitude', 400));
  }
  const distances = await Tour.aggregate([
    // for geospatial aggregation  there is only one  stage and is called $geonear and always needs to be the first stage and one of the index should be geospatial index that is why in index we put 2dsphere in startLocation
    // https://docs.mongodb.com/manual/reference/operator/aggregation/geoNear/#pipe._S_geoNear
    {
      $geoNear: {
        // near: from which the distance needs to be calculated  and specify as geoJson. lng and lat *1 to convert into number
        // although this seems to the first stage in the pipeline we get an error that $geoNear is only valid as the first stage in a pipeline.",BEcause in the tour model we have already defined a aggregate pipeline that runs before this pipeline. SO remove that
        near: {
          type: 'Point',
          coordinates: [lng * 1, lat * 1],
        },
        // distance will be name shown in the tour
        distanceField: 'distance',
        distanceMultiplier: multiplier, // to change into km
      },
    },
    // in the result it gives all the detail nut we want only name and distance so we can remove it by using the project stage and inside we define the name of the field we want to keep and specify value of 1
    {
      $project: {
        distance: 1,
        name: 1,
      },
    },
  ]);
  res.status(200).json({
    status: 'success',
    data: {
      data: distances,
    },
  });
});
