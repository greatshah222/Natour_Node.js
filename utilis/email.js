const nodemailer = require('nodemailer');

const pug = require('pug');
const htmlToText = require('html-to-text');

module.exports = class Email {
  // to create a new email class we will pass in the user and the url
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.from = `Bishal Shah <${process.env.EMAIL_FROM}>`;
  }

  createNewTransport() {
    if (process.env.NODE_ENV === 'production') {
      // sendGrid same like gmail ONLY SERVICE AND AUTH
      // YOU CAN USE MAILSAC TO CREATE FAKE EMAIL ID
      // https://mailsac.com/ FOR SIGNUP CHECK
      return nodemailer.createTransport({
        service: 'SendGrid',
        auth: {
          user: process.env.SENDGRID_USERNAME,
          pass: process.env.SENDGRID_PASSWORD,
        },
      });
    }
    // https://nodemailer.com/smtp/
    /*


    nodemailer.createTransport({
  host: "smtp.example.com",
  port: 587,
  secure: false, // upgrade later with STARTTLS
  auth: {
    user: "username",
    pass: "password"
  }
});




*/
    return nodemailer.createTransport({
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
  }

  async send(template, subject) {
    // send the actual mail

    //1) render html for the email based on the pug template
    // we cannot use res.render(filename) cause we dont want to render but create render out of html . this html can be defined iin the mailOptions like subject and text.it will take a file and then render a real pug code to html
    // __dirname is the current folder
    // html will be cretaed based on the template specified for example in the welcome email the template is welcome.pug so it will take the content from there and pass as an html
    const html = pug.renderFile(
      `${__dirname}/../views/emails/${template}.pug`,
      {
        firstName: this.firstName,
        url: this.url,
        subject,
      }
    );

    // 2) define the email options
    //   // 2 define the email optios
    const mailOptions = {
      from: this.from,
      // option from the argument will be here
      to: this.to,
      subject: subject,
      html: html,
      // convert html to simple text so insatll a package called html-to-text

      text: htmlToText.fromString(html),
      // html:
    };

    // 3)create a transport and send email

    await this.createNewTransport().sendMail(mailOptions);
  }
  // the value are preset here the templates and the subject

  async sendWelcome() {
    // welcome is the template name like in render and second is subject
    await this.send('welcome', 'welcome to the Natours Family!');
  }

  async sendPasswordReset() {
    await this.send(
      'passwordReset',
      'Password Reset. Valid for only 6 minutes'
    );
  }
};

/*










*/

// we are using mailtrap.io SO LOGIN INTO YOUR ACCOUNT
// const sendEmail = catchAsync(async (options) => {
//   // 1 create a transporter i.e service that sends the email
//   const transporter = nodemailer.createTransport({
//     host: process.env.EMAIL_HOST,
//     port: process.env.EMAIL_PORT,
//     // service: 'Gmail',
//     // you dont have to specify host or port while using using gmail just specify service
//     auth: {
//       user: process.env.EMAIL_USERNAME,
//       pass: process.env.EMAIL_PASSWORD,
//     },
//     // activate in gmail "less secure app" option while using gmail
//   });
//   // 2 define the email optios
//   const mailOptions = {
//     from: `Bishal Shah <bishal@mail.com>`,
//     // option from the argument will be here
//     to: options.email,
//     subject: options.subject,
//     text: options.message,
//     // html:
//   };
//   // 3 actually send the email with nodemailer
//   // returns a promise
//   await transporter.sendMail(mailOptions);
// });
// module.exports = sendEmail;
