const User = require('./../models/usermodel');

const AppError = require('./../utilis/appError');
const catchAsync = require('./../utilis/catchAsync');
// here obj= req.body
// allowedFields = email,name
const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  // here req.body has both keys and values so keys will get us only email,name etc and if we want values we can write Object.values(obj)
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) {
      // putting the new object with the current field from obj of current field
      newObj[el] = obj[el];
    }
  });
  return newObj;
};

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();
  res.status(200).json({
    status: 'sucess',
    results: users.length,
    data: {
      users: users,
    },
  });
});
// we have differnet place for updating the userdetail and password
exports.updateMe = catchAsync(async (req, res, next) => {
  // 1 create an error if user try to update and pwd from here
  if (req.body.password || req.body.passwordConfirm) {
    return next(new AppError('You cannot modify password from here', 400));
  }

  // here we cannot use user.save() because it will have validation error and also we cannot remove the validation cause we need to check the validation as well

  // await user.save();
  // 2 update user document
  // so we need to pass here both our id and body in the parameter
  // we  dont want to update req.body cause user can change the role as well
  // can only update name and email

  const filteredBody = filterObj(req.body, 'name', 'email');
  //   Model.findByIdAndUpdate(id, { name: 'jason bourne' }, options, callback)

  // // is sent as
  // Model.findByIdAndUpdate(id, { $set: { name: 'jason bourne' }}, options, callback)
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});
exports.deleteMe = catchAsync(async (req, res, next) => {
  // active will not be shown to the user cause in the schema it has been set the property of select to false like password
  await User.findByIdAndUpdate(req.user.id, { active: false });
  res.status(204).json({
    status: 'success',
    data: null,
  });
});
exports.getUser = (req, res) => {};

exports.createUser = (req, res) => {};
exports.updateUser = (req, res) => {};
exports.deleteUser = (req, res) => {};
