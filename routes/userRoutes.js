const express = require('express');
const userController = require('./../controllers/userController');
const authController = require('./../controllers/authController');
const reviewController = require('./../controllers/reviewController');

const router = express.Router();
router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/logout', authController.logout);

router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);
router.patch(
  '/updatePassword',
  authController.protect,
  authController.updatePassword
);
// upload.single cause we are uploading single photo and then photo is the field name.upload is just to define some settings
// router.patch(
//   '/updateMe',
//   upload.single('photo'),
//   authController.protect,
//   userController.updateMe
// );
router.patch(
  '/updateMe',

  authController.protect,
  userController.uploadUserPhoto,
  userController.resizeUserPhoto,
  userController.updateMe
);

router.delete('/deleteMe', authController.protect, userController.deleteMe);

router
  .route('/getme')
  .get(authController.protect, userController.getMe, userController.getUser);
// all route  from here will be restricted to admin and needs to be logged in
router.use(authController.protect, authController.restrictTo('admin'));
router.route('/').get(userController.getAllUsers);
router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
