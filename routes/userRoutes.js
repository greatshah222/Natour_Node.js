const express = require('express');
const multer = require('multer');
const userController = require('./../controllers/userController');
const authController = require('./../controllers/authController');
const reviewController = require('./../controllers/reviewController');
// where to save the images from the multer and dest is destination
// if u dont define the dest it will be saved in memory and not in destination
// images are not saved in db but just their names
// .upload is just to define some settings
const upload = multer({ dest: 'public/img/users' });

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
router.patch(
  '/updateMe',
  upload.single('photo'),
  authController.protect,
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
