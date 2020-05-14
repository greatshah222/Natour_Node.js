const express = require('express');
const viewController = require('./../controllers/viewController');
const authController = require('./../controllers/authController');

const router = express.Router();

// rendering html
// get(url) and instead of json use render(name of file no extension)
// node will go into the folder mentioned above that is views and then go to base
// the variabe passed from here like the tour and user called locals in the pug data
// test route
// router.get('/', (req, res) => {
//   res.status(200).render('base', {
//     title: ' For adventourous people',
//     tour: 'The Forest Hiker',
//     user: 'Bishal',
//   });
// });
router.use(authController.isLoggedIn); // to see if the user is logged in or not
router.get('/', viewController.getOverview);
router.get('/tour/:slug', viewController.getTour);
router.get('/login', viewController.getLoginForm);

module.exports = router;
