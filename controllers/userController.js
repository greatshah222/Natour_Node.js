const multer = require('multer');
const sharp = require('sharp');

const User = require('./../models/usermodel');

const AppError = require('./../utilis/appError');
const catchAsync = require('./../utilis/catchAsync');
const factory = require('./handlerFactory');
// from multer documentation.defining the destination i.e folder and filename to be given to the saved file
// cb means callback funcation like next
//cb(error(if present else put null),folder where to store(dest) 'public/img/users')
// multerStorage means where to and what name to give to file

// we have to resize image just after saving so we should save image in memory instead of disk

// const multerStorage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, 'public/img/users');
//   },
//   // we are giving filename user-userid-currentTimestamp.extension to not allow multiple file with same name.example
//   // user-97424hfbsb89-74982734982374892374.jpeg.
//   // multer by default dont give any file ext we have to inform them what it is
//   filename: function (req, file, cb) {
//     // remember all the file for multer in in req.file and from there we get all the related info like mimetype which is saved like this there
//     //   mimetype: 'image/jpeg',so taking the [1] to get the extension
//     const ext = file.mimetype.split('/')[1];
//     // so cb(null,user-97424hfbsb89-74982734982374892374.jpeg)

//     cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
//   },
// });
// saving in memory as a buffer which will be available as buffer in sharp
const multerStorage = multer.memoryStorage();

// if the uploaded file is image then we will return as true in the cb function else give an error
const multerFilter = (req, file, cb) => {
  // to check if the uploaded file is image so check the mimetype and it should always start with image like in our example  mimetype: 'image/jpeg',
  if (file.mimetype.startsWith('image')) {
    // no error so true and null
    cb(null, true);
  } else {
    // error so false and define error
    // cb is like next so passing it to global app error handler
    cb(new AppError('not an image.please upload an image', 400), false);
  }
};

// .upload is just to define some settings
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});
// middleware for multer
exports.uploadUserPhoto = upload.single('photo');
// resizing the image of userphoto. we will add this middleware before our updateMe so that it can resize image
exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
  // we have file on our request
  if (!req.file) {
    return next();
    // use sharp package for resizing image https://www.npmjs.com/package/sharp
  }
  // .jpeg cause we are resizing the format to .jpeg
  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;
  // reading the file from buffer saved to the memory. we need square image so 500*500, changing the image format to jpeg and then quality of image is 90% of original and then write the file to the disk cause we no longer have where to store the file like in the multer disk storage .toFile(entire path)
  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);
  next();
});
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

exports.getAllUsers = factory.getAll(User);
// exports.getAllUsers = catchAsync(async (req, res, next) => {
//   const users = await User.find();
//   res.status(200).json({
//     status: 'sucess',
//     results: users.length,
//     data: {
//       users: users,
//     },
//   });
// });
// we have differnet place for updating the userdetail and password
exports.updateMe = catchAsync(async (req, res, next) => {
  console.log(req.file);
  // { this is req.file
  //   Cookie_1: 'value',
  //   jwt: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVjOGExZjI5MmY4ZmI4MTRiNTZmYTE4NCIsImlhdCI6MTU5MDgzNDQxMiwiZXhwIjoxNTk4NjEwNDEyfQ.fWF-FYF2JftokAa_-6BS69BDdngwxxmk3P9TyeqWrBI'
  // }
  // {
  //   fieldname: 'photo',
  //   originalname: 'user-6.jpg',
  //   encoding: '7bit',
  //   mimetype: 'image/jpeg',
  //   destination: 'public/img/users',
  //   filename: 'd73115752f62ac0259439260489f7628',
  //   path: 'public/img/users/d73115752f62ac0259439260489f7628',
  //   size: 6400
  // }
  //console.log(req.body);
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
  // if there is req.file we will add one more property of photo to the filteredBody and save its filename so it can be updated(only of there is req.file)
  if (req.file) {
    filteredBody.photo = req.file.filename;
  }

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
// for user rertiving their own data
exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};
exports.getUser = factory.getOne(User);
// only for admin to create/update/delete User using this route
// validation might not work and pwd update not possible
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);
