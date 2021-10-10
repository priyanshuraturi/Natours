const nodemailer = require('nodemailer');

const catchAsync = require('./catchAsync');

const sendEmail = catchAsync(async (options) => {
  //1) Create Transort

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
  // Activate in Gmail "Less Secure App " Option
  //2) Define the Email options
  const mailOptions = {
    from: 'Priyanshu Raturi <Natours.io>',
    to: options.email,
    subject: options.subject,
    text: options.message,
    //html
  };
  //3) Actually Send Email
  await transporter.sendMail(mailOptions);
});

module.exports = sendEmail;
