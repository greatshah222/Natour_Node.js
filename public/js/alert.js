/* eslint-disable */

export const hideAlert = () => {
  const el = document.querySelector('.alert');
  if (el) el.parentElement.removeChild(el);
};
// type is either success or erroe
export const showAlert = (type, msg) => {
  // whenever we want to show an alert hide ll the alert first
  hideAlert();
  const markup = `<div class="alert alert--${type}">${msg}</div>`;
  // where we want to use this in the body afterbegin
  document.querySelector('body').insertAdjacentHTML('afterbegin', markup);
  // also hide alert after 3 s
  window.setTimeout(hideAlert, 3000);
};
