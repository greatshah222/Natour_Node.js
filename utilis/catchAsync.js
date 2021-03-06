// replacing try catch by using function
// we use next for error handling in there functions although they are not middleware
// this function will work if the promisse is rejected
// fn is just the name here
module.exports = (fn) => {
  // this return function will be called by express and then catchAsync will be called later
  // when the express calls the function it will have both the req and res and next is used for error middleware so express will return this which will later call our catchAsync function
  return (req, res, next) => {
    fn(req, res, next).catch((err) => next(err));
  };
};
