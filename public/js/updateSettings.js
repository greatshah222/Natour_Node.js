// updateData

import axios from 'axios';
import { showAlert } from './alert';
// type is either password or data
// data is data object
// we are changing the data and the password both in one setting
export const updateSettings = async (data, type) => {
  try {
    const url =
      type === 'password'
        ? 'http://127.0.0.1:8000/api/v1/users/updatePassword'
        : 'http://127.0.0.1:8000/api/v1/users/updateMe';
    const res = await axios({
      method: 'PATCH',

      url: url,
      data: data,
    });
    // if the status is success we want to redirect user after 1.5 s so location.assign
    if (res.data.status === 'success') {
      location.reload(true);
      showAlert('success', ` ${type.toUpperCase()} updated successfully`);
    }
    console.log(res);
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
