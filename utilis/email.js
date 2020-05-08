const nodemailer = require('nodemailer');
const catchAsync = require('./catchAsync');
// we are using mailtrap.io SO LOGIN INTO YOUR ACCOUNT
const sendEmail = catchAsync(async (options) => {
  // 1 create a transporter i.e service that sends the email
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    // service: 'Gmail',
    // you dont have to specify host or port while using using gmail just specify service
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
    // activate in gmail "less secure app" option while using gmail
  });
  // 2 define the email optios
  const mailOptions = {
    from: `Bishal Shah <bishal@mail.com>`,
    // option from the argument will be here
    to: options.email,
    subject: options.subject,
    text: options.message,
    // html:
  };
  // 3 actually send the email with nodemailer
  // returns a promise
  await transporter.sendMail(mailOptions);
});
module.exports = sendEmail;
