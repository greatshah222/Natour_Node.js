/* eslint-disable */

// axios return a promisse but throws an error when there is an error so try catch

import axios from 'axios';
import { showAlert } from './alert';
export const login = async (email, password) => {
  console.log(email, password);
  try {
    const res = await axios({
      method: 'POST',
      url: 'http://127.0.0.1:8000/api/v1/users/login',
      data: {
        email: email,
        password: password,
      },
    });
    // if the status is success we want to redirect user after 1.5 s so location.assign
    if (res.data.status === 'success') {
      showAlert('success', 'Logged in successfully');
      window.setTimeout(() => {
        location.assign('/');
      }, 500);
    }
    console.log(res);
  } catch (err) {
    showAlert('error', err.response.data.message); // will give our appErrror error
  }
};
