const crypto = require('crypto');
const { promisify } = require('util');
// for all the JWT related handling install npm i jsonwebtoken
const jwt = require('jsonwebtoken');
const AppError = require('./../utilis/appError');

const catchAsync = require('./../utilis/catchAsync');
const sendEmail = require('./../utilis/email');

const User = require('./../models/usermodel');
// jwt.sign(payload, secretOrPrivateKey, [options, callback])
// (Asynchronous) If a callback is supplied, the callback is called with the err or the JWT.
const signToken = (id) => {
  return jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};
const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  // token no longer valid after proceess.env.JWT_EXPIRES_IN
  // send a cookies
  // it is set in the response so we name it jwt and data we want to send is token and optios for cookie
  // JWT_COOKIES_EXPIRES is set to 90 days so changing in millisecond
  // secure is true means it will only be sent in https
  // cookies can not be modified by browser when we use httpOnly
  // we are sepearating this into separate variable because this will only work in https and not in postman or localhost
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    // secure: true,
    httpOnly: true,
  };
  if (process.env.NODE_ENV === 'production') {
    cookieOptions.secure = true;
  }
  res.cookie('jwt', token, cookieOptions);
  // when we signup there will be password in the data so to hide it
  user.password = undefined;
  res.status(statusCode).json({
    status: 'success',
    token: token,
    data: {
      user: user,
    },
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt,
    role: req.body.role,
  });
  // in mangodb id is _id
  // The secret key is combined with the header and the payload to create a unique hash. You are only able to verify this hash if you have the secret key.
  // it should be atleast 32 charcter long
  // var token = jwt.sign({ foo: 'bar' }, privateKey, { algorithm: 'RS256'});
  // login user after signin
  //   const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
  //     expiresIn: process.env.JWT_EXPIRES_IN,
  //   });
  createSendToken(newUser, 201, res);
  //   const token = signToken(newUser._id);
  //   // token no longer valid after proceess.env.JWT_EXPIRES_IN
  //   res.status(201).json({
  //     status: 'success',
  //     token: token,
  //     data: {
  //       user: newUser,
  //     },
  //   });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // check if email and password exists
  if (!email || !password) {
    return next(new AppError('Please provide your credential', 400));
  }

  // check if the user exits and password is correct
  // here we have to .select (password) cause it is hidden from our db in our user model
  const user = await User.findOne({ email: email }).select('+password');
  // console.log(user);
  // our userSchema.methods.correctPassword specified in userModel is available to every instance of user model and here const user is an instance after findind the User.findOne
  // it is async function
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect Credential', 401));
  }
  // if everything is ok send token to client
  createSendToken(user, 200, res);
  // const token = signToken(user._id);
  // res.status(200).json({
  //   status: 'success',
  //   token: token,
  // });
});
exports.protect = catchAsync(async (req, res, next) => {
  let token;
  // 1 getting token and check if its there
  // the token is ssent by the header so in the key it usuallu have authorization and and in value it have Bearer (token)
  // so authorization  Bearer (token)
  // to get token we can split it by space
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    // we wanted to use token here but cant assign it here cause let and const are block scope
    token = req.headers.authorization.split(' ')[1];
  }
  //console.log(token);
  if (!token) {
    return next(
      new AppError('You are not logged in.Please login to get access.', 401)
    );
  }
  // 2 validate(verification of) the token
  // to verify it alos needs secret
  // promisify is like async await and we have to import it from it is built-in node promisify
  //   jwt.verify(token, secretOrPublicKey, [options, callback]);

  //   (Asynchronous) If a callback is supplied, function acts asynchronously. The callback is called with the decoded payload if the signature is valid and optional expiration, audience, or issuer are valid. If not, it will be called with the error.

  // (Synchronous) If a callback is not supplied, function acts synchronously. Returns the payload decoded if the signature is valid and optional expiration, audience, or issuer are valid. If not, it will throw the error.
  // here we will call the function promisify(jwt.verify) which will reurn the promise (token, process.env.JWT_SECRET)
  // we can do await because the parent function is already async function
  // it will auto give the errror and send the error auto to error middlware cause promisify is of node we dont have to send it to our errorglobalHandler
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  // remember our payload is our id so it console.logs our id alsong with iat(creation date ) and exp(experiation-date)
  // { id: '5eb2a126609aee21646f0b85', iat: 1588774567, exp: 1588860967 }
  // console.log(decoded);

  // 3 check if user still exits
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError('The User belonging to this token no-longer exists', 401)
    );
  }
  // 4 check if user changed password after the JWT(token) was issued
  // create instance method again
  // if (currentUser.changedPasswordAfter()) {
  //   if (currentUser.changedPasswordAfter(decoded.iat)) {
  //     // if it is true i.e pwd was changed it will send an error
  //     return next(
  //       new AppError(
  //         'User recently changed the Credential.Please try logging it with new Credential',
  //         401
  //       )
  //     );
  //   }
  // }
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed password! Please log in again.', 401)
    );
  }

  // grant access to protected route
  req.user = currentUser;
  //console.log(req.user);
  next();
});

// restrict user
// we are returning a function that accept the roles parameter cause we cannot specify the argument in our middleware
// function return a new function
// like catchAsync function we are passing function inside function  and the first function returns the second function and because of closure the second function has access to first function parameter
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // currentUser from upper middleware
    // roles is an array['admin','lead-role];
    // if role="user" no permission
    if (!roles.includes(req.user.role)) {
      return next(new AppError('You Do not have the permission', 403));
    }
    next();
  };
};

exports.forgotPassword = async (req, res, next) => {
  // 1 get user based on posted email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('There is no user with that email ID', 404));
  }
  // 2 generate the random reset token
  const resetToken = user.createPasswordResetToken();
  // save the token and expiry time
  // cancelling all the validation because here the user is not logged in and we want to save the token and expirytime in our db to compare it with later on
  // if u dont write { validateBeforeSave: false } u will get validation error of writing pwd and confirm etc
  await user.save({ validateBeforeSave: false });
  // create the instance token
  //  3 send it to user's email
  // just remember we are sending the not encrypted version of token . encrypted version is stored in db for security
  // http or https is called req.protocol
  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;
  const message = `Forgot your password? Click the link to create a new one by clicking \n ${resetURL} \n please ignore the message if you did not request it `;
  // we need try catch for this
  try {
    await sendEmail({
      email: user.email,
      subject: 'Your password reset token(Valid for 10 Minutes) ',
      message: message,
    });
    res.status(200).json({
      status: 'success',
      message: 'Please Check your Email',
    });
  } catch (err) {
    // if there is error sending the email we have to simply reset the field of token and Expires so setting to undefined will do the trick
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    // it only modeifies the data so we have to save it
    await user.save({ validateBeforeSave: false });
    return next(
      new AppError(
        'There was an error sending an email. Please try again later',
        500
      )
    );
  }
};
exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1 get user based on token
  // token is specified in the req.url

  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  // 2 set the new pwd only if token has not expired and there is user
  // if the token has expired it will simply not send any user so we can only check if the user exists at this point
  if (!user) {
    return next(new AppError('Your tokenis invalid or  has Expired.', 400));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // 3 update the changePasswordAt property

  // log the userin , send JWT
  // const token = signToken(user._id);

  // res.status(201).json({
  //   status: 'success',
  //   token: token,
  //   // data: {
  //   //   user: user,
  //   // },
  // });
  createSendToken(user, 201, res);
});

// update user detail(pwd)
// ask for pwd again before updating although user is logged in
exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1 get user from the collection

  const user = await await User.findById(req.user.id).select('+password');
  // 2 check if posted pwd is correct

  if (!(await user.correctPassword(req.body.currentPassword, user.password))) {
    next(new AppError('Password does not match', 401));
  }
  // we cannot use findByIDAndUpdate because our validation will not work
  // 3 if correct update pwd
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();
  createSendToken(user, 201, res);
  // log user again with new pwd
});
