const express = require('express');
const morgan = require('morgan');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();

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
app.use(express.json());
app.use(express.static(`${__dirname}/public`));
// the middleware always has the incoming request and sends the response to next middleware step by step so it has all the req,res and next parameter. next paramter is third parameter and u can name whatever but the convention is to name next as req, res
// creating our own middleware for test purpose
app.use((req, res, next) => {
  console.log(' Hello from the middleware 👑');
  // we need to call next else the request will be stocked
  next();
});
// add current time to the object .just practising middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
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

// Server

module.exports = app;
