const AppError = require('./../utilis/appError');
// here err.path is actual name of the error object for example email or name or id . Simillarly err.value is the value of that error object which we define in our query
const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}:${err.value}`;
  return new AppError(message, 400);
};

// for duplicate fields error
const handleDuplicateFieldsDB = (err) => {
  const message = `${err.keyValue.name}: already exists. Please change your value`;
  return new AppError(message, 400);
};
// for validation Error
const handleValidationErrorDB = (err) => {
  // loop over all the error object like in ratings and name and all other
  const message = ` ${err.message}`;
  return new AppError(message, 400);
};
const sendErrorDev = (err, req, res) => {
  // original Url is entire url without host
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  }
  // rendered website error.pug
  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong',
    msg: err.message,
  });
};
const handleJsonValidationErrorDB = (err) => {
  const message = ` Invalid Token. Please login to continue`;
  return new AppError(message, 401);
};
const handleJsonExpiredTokenValidationErrorDB = (err) => {
  const message = `Token Expired. Please login again to continue`;
  return new AppError(message, 401);
};
const sendErrorProd = (err, req, res) => {
  // error is operational means all our error handler willhave this value as true and if there  is a server error it will not have this property and finally we can send our custom error of internalserver error and also we dont want to leak error details to client
  // for api error habdler
  if (req.originalUrl.startsWith('/api')) {
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    }
    // log error
    console.error('Error 💣', err);
    // send generic message
    return res.status(500).json({
      status: 'error',
      message: 'Something Went very Wrong 😢 ',
    });
  }
  // for not api error handler
  // rendered website
  if (err.isOperational) {
    console.log(err);
    return res.status(err.statusCode).render('error', {
      title: 'Something went wrong!',
      msg: err.message,
    });
  }
  // log error
  console.error('Error 💣', err);
  // send generic message
  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong!',
    msg: 'please try again later',
  });
};

// error handling middleware it is builtin express
// it is detected auto by express if given 4 parameter
// it takes 4 argument err,req,res,next
module.exports = (err, req, res, next) => {
  // read the status code from the error object if it is defined else 500 which means internal server errror
  // stack give where the error originated
  // console.log(err.stack);
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  // here we are sttting different error for our customer in the production field and for developer in our development field for better error-handling
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    // we are using spread operator so that we dont change the original error stored in err
    let error = { ...err };
    // for weired reason the message from err is not being passed to error so ,
    error.message = err.message;
    // every error has its name u can check it in postman
    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === 'ValidationError')
      error = handleValidationErrorDB(error);
    if (error.name === 'JsonWebTokenError')
      error = handleJsonValidationErrorDB(error);
    if (error.name === 'TokenExpiredError')
      error = handleJsonExpiredTokenValidationErrorDB(error);

    sendErrorProd(error, req, res);
  }
};
//     "message": "Invalid input data Tour validation failed: ratingsAverage: Rating must be above 1.0"
