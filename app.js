const express = require('express');
const morgan = require('morgan');

const rateLimit = require('express-rate-limit');
// it is to limit the nr of request coming from the dame ip address for securuty it will block if there is too many request
// chack the documentation
// https://github.com/nfriedly/express-rate-limit
// npm i express-rate-limit
const helmet = require('helmet');
// npm i helmet
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
// npm i hpp for not allowing parameter pollution

const AppError = require('./utilis/appError');
const gobalErrorhandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();
//  Set Security HTTP headers  always at the top of the page after using express
// you can again check it in the header there are many added headers for security
// https://github.com/helmetjs/helmet
app.use(helmet());

// Middleware
// we have access to env variable even here because its still in the process and is available in all file
// morgan is a logging middleware and is to see the request data in the console
// dev is just for how the login looks like . ucan use other as well check in the internet
// here if the production mode changes to production this morgan middleware doesnot or wont work

//console.log(process.env.NODE_ENV);

if (process.env.NODE_ENV === 'development') {
  // 3rd party middleware for login
  app.use(morgan('dev'));
  // POST /api/v1/tours 201 14.719 ms - 143
  // this is the benefit of using morgan it gives us all the post or get request and all other parameter
}

// it is middleware and the step where the request goes through
// for limiting the nr of request it will apply to all the middleware that is why it is in app.js

//  apply to all requests and limit request from same API

const limiter = rateLimit({
  max: 100, // limit each IP to 100 requests per windowMs(window millisecond)
  windowMs: 60 * 60 * 1000, // 1 hour
  message: 'Too many request from this IP. Please try again in an hour',
  // you can check this in the header of response
});
// affect routes starting with api
app.use('/api', limiter);
// Body Parser, reading data from the body into req.body
// here we are limiting the data to 10kb not necessary but just for protection
app.use(express.json({ limit: '10kb' }));

// clean the data i.e data sanitization against NoSQL query injection
// for example we know the pwd of some account but not the user_id we can type {"gt":""} to gain access cause this will always be true '
// to solve this problem
// npm i express-mongo-sanitize
app.use(mongoSanitize());

// data sanitization against XSS clean user input from any html malicious code
//npm i xss-clean
app.use(xss());

// for not allowing paramter pollution. it should be used at the end
// for instance if we say sort by price and sort by rating it does not make sense cause we want only one sort property at the time so
// app.use(hpp());
// but in some case we want 2 property like duration=2 and duration=9 so we need to whitelist some parameter which means it will allow this property
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsAverage',
      'ratingsQuantity',
      'maxGroupSize',
      'price',
      'difficulty',
    ],
  })
);

// Serving static files
app.use(express.static(`${__dirname}/public`));
// the middleware always has the incoming request and sends the response to next middleware step by step so it has all the req,res and next parameter. next paramter is third parameter and u can name whatever but the convention is to name next as req, res
// creating our own middleware for test purpose
// test middleware
app.use((req, res, next) => {
  console.log(' Hello from the middleware 👑');
  // we need to call next else the request will be stocked
  next();
});
// add current time to the object .just practising middleware
// test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  //console.log(req.headers);

  next();
});

// app.get('/', (req, res) => {
//     res.status(200).json({ message: 'Hello from the server side', app: 'natours' });

// })
// app.post('/', (req, res) => {
//     res.send('you can post to this endepoint')

// });
// read the json data before sending it for event loop for non-blocking code

// route Hanlder

// app.get('/api/v1/tours', getAllTours);
// // it is like laravel for getting one id there we used {id} here we use :id
// app.get('/api/v1/tours/:id', getTour);

// app.post('/api/v1/tours', createTour)
// app.patch('/api/v1/tours/:id', updateTour)

// app.delete('/api/v1/tours/:id', deleteTour)

// Routes
// using the router to break the route into indicidual file so they dont break the code when writting big long code

// tourROuter and user  here is a middleware so that we can use here app.use like any other middleware enlisted above

app.use('/api/v1/users', userRouter);
app.use('/api/v1/tours', tourRouter);
// if the route is not defined we use middleware after our router cause if the route belonged to them it will not reach here. if it reached here it means the route is mistake.SO for all route use app.all and * means everything
// ${req.originalUrl}   is the original input route by user
app.all('*', (req, res, next) => {
  // res.status(404).json({
  //   status: 'fail',
  //   message: `Can't find ${req.originalUrl} on the server`,
  // });
  // here the string inside the ERROR() will be error message property
  // const err = new Error(`Can't find ${req.originalUrl} on the server`);
  // err.status = 'fail';
  // err.statusCode = 404;
  // // here the next should call the error handler and not to other middleware cause its already an error
  // next(err);
  // using the AppError class to create the error
  // message is inside the AppError
  // here APPError extends Error so it can use builtin error
  next(new AppError(`Can't find ${req.originalUrl} on the server`, 404));
});
// error handler from errorController which will be used by app
app.use(gobalErrorhandler);
// Server

module.exports = app;
