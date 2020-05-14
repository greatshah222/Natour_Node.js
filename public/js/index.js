/* eslint-disable */
// polyfill to let js work in old browser. it should be first line
import '@babel/polyfill';
import { displayMap } from './mapBox';

import { login } from './login';
// this is the entry file
// DOM ELEMENTS
const mapBox = document.getElementById('map');
const loginForm = document.querySelector('.form');

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
