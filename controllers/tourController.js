const fs = require('fs');

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
);
// this is param middleware
exports.checkID = (req, res, next, val) => {
  console.log(`tour id is ${val}`);
  if (req.params.id * 1 > tours.length) {
    return res.status(401).json({
      status: 'fail',
      message: 'invalid TOur id',
    });
  }
  next();
};
// this middleware is for checkinf isf the response body has both name and price in our response
exports.checkBody = (req, res, next) => {
  if (!req.body.name || !req.body.price) {
    return res.status(404).json({
      status: 'fail',
      message: 'Missing either name or price.',
    });
  }
  next();
};

exports.getAllTours = (req, res) => {
  console.log(req.requestTime);
  res.status(200).json({
    status: 'sucess',
    requestedAt: req.requestTime,
    results: tours.length,
    data: {
      tours: tours,
    },
  });
};

exports.getTour = (req, res) => {
  // we can get our parameter of request id using req.params
  console.log(req.params);
  // convert string to num
  const id = req.params.id * 1;

  const tour = tours.find((el) => el.id === id);
  res.status(200).json({
    status: 'success',
    data: {
      tour: tour,
    },
  });
};
exports.createTour = (req, res) => {
  // console.log(req.body);
  const newId = tours[tours.length - 1].id + 1;
  // assign is used to create new object by merging with another
  const newTour = Object.assign({ id: newId }, req.body);
  tours.push(newTour);
  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
    JSON.stringify(tours),
    (err) => {
      res.status(201).json({
        status: 'success',
        data: {
          tour: newTour,
        },
      });
    }
  );
};
exports.updateTour = (req, res) => {
  {
    res.status(200).json({
      status: 'succees',
      data: {
        tour: 'updates Tour',
      },
    });
  }
};
exports.deleteTour = (req, res) => {
  res.status(204).json({
    status: 'success',
    data: null,
  });
};
