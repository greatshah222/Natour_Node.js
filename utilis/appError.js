// it is extending built-in error classs
class AppError extends Error {
  // constructor method is called each we call this class
  constructor(message, statusCode) {
    // we didnt write message = this.message because we called in the parent class in the super
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    // it will have operational error
    // appError is for operational error
    this.isOperational = true;
    // stack track shows where the error originated parameter is the current object and app error class itself which is this.constructor
    // this will give where the error originiated. it will capture the stack at that trace in that object which is the current object in this constructor class and returns as an string
    Error.captureStackTrace(this, this.constructor);
  }
}
module.exports = AppError;
