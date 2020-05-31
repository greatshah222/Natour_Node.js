/* eslint-disable */

import axios from 'axios';
import { showAlert } from './alert';

// this is the front end for stripe where we need pur public key but in the serverside we need our secret key

const stripe = Stripe('pk_test_J8nZHumuTjy4Z1lP54yi1XCD00ZiUSkPG3');

export const bookTour = async (tourId) => {
  try {
    console.log(tourId);
    // 1) get the chekout session from the server
    const session = await axios(
      `http://127.0.0.1:8000/api/v1/bookings/checkout-session/${tourId}`
    );
    console.log(session);

    // 2) create the checkout form and charge the credit card for us
    await stripe.redirectToCheckout({
      // when u console.log session there is data and inside u will finfd he id in session
      // this is id id: "cs_test_sskHya1V26WW1yckpOBO5rpOInVY8W4jf4QxJN51RyVFGonz7uTcivaV"

      sessionId: session.data.session.id,
    });
  } catch (err) {
    console.log(err);
    showAlert('error', err);
  }
};
