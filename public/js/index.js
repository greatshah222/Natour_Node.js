/* eslint-disable */
// polyfill to let js work in old browser. it should be first line
import '@babel/polyfill';
import { displayMap } from './mapBox';
import { bookTour } from './stripe';

import { login, logout } from './login';
import { updateSettings } from './updateSettings';
// this is the entry file
// DOM ELEMENTS
const mapBox = document.getElementById('map');
const loginForm = document.querySelector('.form--login');
// for logout
const logOutBtn = document.querySelector('.nav__el--logout');
// for updating data
const updateUserForm = document.querySelector('.form-user-data');
// for password change
const updatePasswordForm = document.querySelector('.form-user-settings');
const bookBtn = document.getElementById('book-tour');

// values

// we used to get error in other page when mapBox was not used so this is the solution
// delegations
if (mapBox) {
  const locations = JSON.parse(mapBox.dataset.locations);
  displayMap(locations);
}
if (loginForm) {
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    // the value of this email and pwd can only be accessed in event listner
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    login(email, password);
  });
}
// logout

if (logOutBtn) {
  logOutBtn.addEventListener('click', logout);
}

if (updateUserForm) {
  updateUserForm.addEventListener('submit', (e) => {
    e.preventDefault();
    // for images upload if we dont use html form direct here we are using this api so to add the entype=multipart
    const form = new FormData();
    form.append('name', document.getElementById('name').value);
    form.append('email', document.getElementById('email').value);
    // photo is in array so .files[0]
    form.append('photo', document.getElementById('photo').files[0]);
    console.log(form);
    // const name = document.getElementById('name').value;
    // const email = document.getElementById('email').value;
    // updateSettings({ name, email }, 'data');
    // for adding images
    updateSettings(form, 'data');
  });
}

if (updatePasswordForm) {
  updatePasswordForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    document.querySelector('.btn--save-password').textContent = 'UPDATING...';
    const currentPassword = document.getElementById('password-current').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password-confirm').value;
    // await cause update Settings is async function and to clear we need await
    await updateSettings(
      { currentPassword, password, passwordConfirm },
      'password'
    );
    // we have set the saving text to updating while the operation of changing password is done so after await
    document.querySelector('.btn--save-password').textContent = 'SAVE PASSWORD';
    document.getElementById('password-current').value = '';
    document.getElementById('password').value = '';
    document.getElementById('password-confirm').value = '';
    document.getElementById('password-confirm').blur();
  });
}

if (bookBtn) {
  bookBtn.addEventListener('click', (e) => {
    // remember all the dataset name are converted to lowercase even if u define it as TOURID which accessing it will be tourid
    console.log(e.target.dataset.tourid);
    e.target.textContent = 'Processing...';
    const tourid = e.target.dataset.tourid;

    bookTour(tourid);
  });
}
