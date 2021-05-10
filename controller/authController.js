const crypto = require("crypto");

const jwt = require("jsonwebtoken");
const { decode } = require("punycode");

const User = require("../model/userModel");
const sendEmail = require("../util/sendEmail");

exports.signup = async (req, res, next) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    // creating new user
    const newUser = await User.create({
      name,
      email,
      password,
      confirmPassword,
    });

    // checking if user is created
    if (!newUser) {
      return res.status(401).json({
        status: "fail",
      });
    }

    // generating jwt
    const token = jwt.sign(
      {
        id: newUser._id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN,
      }
    );
    // creating verification token
    const verificationToken = newUser.createVerificationToken();

    await newUser.save({ validateBeforeSave: false });

    // sending verification mail to client
    sendEmail(
      [newUser.email],
      "Verify Account",
      "Verify your Account",
      `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Verify Account</title>
        </head>
        <body>
            <p>Please click on the link to verify your account on skilly.com</p>
            <a href="${req.protocol}://${req.get(
        "host"
      )}/api/v1/users/verifyUser/${verificationToken}">Click Here</a>
        </body>
        </html>`
    );

    res.status(201).json({
      status: "success",
      token,
      data: {
        user: {
          role: newUser.role,
          name: newUser.name,
          email: newUser.email,
        },
      },
    });
  } catch (err) {
    res.status(500).json({
      status: "Fail",
    });
  }
};

exports.verifyUser = async (req, res, next) => {
  try {
    const hashedToken = req.params.verifyToken;

    if (!hashedToken) throw Error("Varification Token is missing or invalid");

    const decodedToken = crypto
      .createHash("sha256")
      .update(hashedToken)
      .digest("hex");

    const user = await User.findOne({ verifyAccountToken: decodedToken });

    if (!user) throw Error("Verification Token Expired or Invalid");

    user.status = "verified";
    user.verifyAccountToken = undefined;
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      status: "Success",
      data: "Account verified successfully",
    });
  } catch (err) {
    res.status(500).json({
      status: "Fail",
      message: err.message,
    });
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    //   checking for email and password
    if (!email || !password) throw Error("Email or password is missing");

    // getting the user
    const user = await User.findOne({ email }).select("+password");

    if (!user || !(await user.correctPassword(password, user.password)))
      throw Error("email or password is incorrect");

    //   checking for password
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });

    res.status(200).json({
      status: "success",
      token: token,
    });
  } catch (err) {
    res.status(500).json({
      status: "fail",
      message: err.message,
    });
  }
};

exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) throw new Error("Email must be provided");

    const user = await User.findOne({ email });

    if (!user) throw new Error("Email not found");

    const resetToken = user.creatingResetToken();

    await user.save({ validateBeforeSave: false });

    sendEmail(
      [user.email],
      "Reset Password Link Expires in 60 minutes",
      undefined,
      `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Reset Password</title>
        </head>
        <body>
            <p>Please click on the link to reset password of your account on skilly.com</p>
            <small>Note: Link expires in 60 minutes</small>
            <a href="${req.protocol}://${req.get(
        "host"
      )}/api/v1/users/resetPassword/${resetToken}">Click Here</a>
        </body>
        </html>`
    );

    res.status(200).json({
      status: "success",
      data: null,
    });
  } catch (err) {
    res.status(500).json({
      status: "fail",
      message: err.message,
    });
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const { password, confirmPassword } = req.body;

    const { token } = req.params;

    if (!password || !confirmPassword || !token) {
      throw new Error("Password and Confirm Password must be provided");
    }

    const decodedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user = await User.findOne({ resetPasswordToken: decodedToken });

    if (!user || !user.validateResetToken()) {
      throw new Error("Reset Token is invalid or expired");
    }

    user.password = password;
    user.confirmPassword = confirmPassword;
    user.resetTokenExpires = undefined;
    user.resetPasswordToken = undefined;

    await user.save();

    res.status(202).json({
      status: "success",
      message: "Password reset successfully",
    });
  } catch (err) {
    res.status(500).json({
      status: "fail",
      message: err.message,
    });
  }
};

exports.protect = async (req, res, next) => {
  try {
    const { authorization } = req.headers;
    if (!authorization || !authorization.startsWith("Bearer"))
      throw new Error("Token not found or Invalid");

    const token = authorization.split(" ")[1];

    const payload = await jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(payload.id);

    if (!user) throw new Error("User Does not Exists");

    if (user.passwordChangedAfter(payload.iat)) {
      throw new Error("Please Login in again with new password");
    }

    req.user = user;
    next();
  } catch (err) {
    res.status(500).json({
      status: "success",
      message: err.message,
    });
  }
};

exports.restrictTo = (...roles) => (req, res, next) => {
  const user = req.user;
  if (!roles.includes(user.role)) {
    return res.status(403).json({
      status: "fail",
      message: "Access Forbidden",
    });
  }
  next();
};
