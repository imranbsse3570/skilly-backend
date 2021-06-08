const nodemailer = require("nodemailer");
const mg = require("nodemailer-mailgun-transport");

const sendEmail = async (emails, subject, text, html) => {
  let transporter;

  if (process.env.NODE_ENV === "production") {
    const auth = {
      auth: {
        api_key: process.env.PRODUCTION_EMAIL_API_KEY,
        domain: process.env.PRODUCTION_EMAIL_DOMAIN,
      },
    };

    transporter = nodemailer.createTransport(mg(auth));
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
    text, // plain text body
    html, // html body
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
