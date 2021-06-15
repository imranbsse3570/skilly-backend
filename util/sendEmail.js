const nodemailer = require("nodemailer");

const sendEmail = async (emails, subject, html) => {
  try {
    let transporter;

    if (process.env.NODE_ENV === "production") {
      // transporter = nodemailer.createTransport({
      //   host: process.env.PRODUCTION_EMAIL_HOST,
      //   port: process.env.PRODUCTION_EMAIL_PORT,
      //   auth: {
      //     user: process.env.PRODUCTION_EMAIL_USERNAME,
      //     pass: process.env.PRODUCTION_EMAIL_PASSWORD,
      //   },
      // });
      transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.PRODUCTION_GMAIL,
          pass: process.env.PRODUCTION_GMAIL_PASSWORD,
        },
      });
    } else {
      transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
          user: process.env.EMAIL_USERNAME,
          pass: process.env.EMAIL_PASSWORD,
        },
      });
    }

    const mailOptions = {
      from: `${process.env.EMAIL_SENDER_NAME} <${process.env.EMAIL_OF_SENDER}>`, // sender address
      to: emails.join(","), // list of receivers
      subject, // Subject line
      html, // html body
    };

    await transporter.sendMail(mailOptions);
  } catch (err) {
    console.log(err);
  }
};

module.exports = sendEmail;
