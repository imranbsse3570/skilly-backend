const crypto = require("crypto");

const validator = require("validator");
const jwt = require("jsonwebtoken");

const User = require("../model/userModel");
const sendEmail = require("../util/sendEmail");
const catchAsync = require("../util/catchAsync");
const AppError = require("../util/appError");

const generatingJWTToken = (id, expires) => {
  const expiresIn = expires || process.env.JWT_EXPIRES_IN;
  return jwt.sign(
    {
      id,
    },
    process.env.JWT_SECRET,
    {
      expiresIn,
    }
  );
};

const setCookiesAndResponse = (user, res, statusCode) => {
  // generating jwt
  const expires = statusCode === 204 ? 1000 : undefined;
  const token = generatingJWTToken(user._id, expires);

  const cookiesOption = {
    httpOnly: true,
    expires: new Date(
      Date.now() + process.env.COOKIES_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
  };

  if (process.env.NODE_ENV === "PRODUCTION") {
    cookiesOption.secure = true;
  }

  res.cookie("jwt", token, cookiesOption);

  user.password = undefined;
  user.verifyAccountToken = undefined;
  user.resetPasswordToken = undefined;
  user.resetTokenExpires = undefined;

  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};

exports.signup = catchAsync(async (req, res, next) => {
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
    return next(new AppError("User Already Exists", 400));
  }

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

  setCookiesAndResponse(newUser, res, 201);
});

exports.verifyUser = catchAsync(async (req, res, next) => {
  const hashedToken = req.params.verifyToken;

  if (!hashedToken) throw Error("Varification Token is missing or invalid");

  const decodedToken = crypto
    .createHash("sha256")
    .update(hashedToken)
    .digest("hex");

  const user = await User.findOne({ verifyAccountToken: decodedToken });

  if (!user) {
    return next(new AppError("Verification Token Expired or Invalid", 401));
  }

  user.status = "verified";
  user.verifyAccountToken = undefined;
  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    status: "Success",
    data: "Account verified successfully",
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  //   checking for email and password
  if (!email || !password) {
    return next(new AppError("Email or password is missing"), 400);
  }

  // getting the user
  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.correctPassword(password, user.password)))
    return next(new AppError("email or password is incorrect", 401));

  //   checking for password
  setCookiesAndResponse(user, res, 200);
});

exports.forgotPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return next(new AppError("Email must be provided", 400));
  }

  const user = await User.findOne({ email });

  if (!user) {
    return next(new AppError("Email not found", 404));
  }

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
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  const { password, confirmPassword } = req.body;

  const { token } = req.params;

  if (!password || !confirmPassword || !token) {
    return next(
      new AppError("Password and Confirm Password must be provided", 400)
    );
  }

  const decodedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({ resetPasswordToken: decodedToken });

  if (!user || !user.validateResetToken()) {
    return next(new AppError("Reset Token is invalid or expired", 401));
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
});

exports.protect = catchAsync(async (req, res, next) => {
  const { authorization } = req.headers;
  if (!authorization || !authorization.startsWith("Bearer")) {
    return next(new AppError("Token not found or Invalid", 401));
  }

  const token = authorization.split(" ")[1];

  const payload = await jwt.verify(token, process.env.JWT_SECRET);

  const user = await User.findById(payload.id).select("+password");

  if (!user) {
    return next(new AppError("User Does not Exists", 404));
  }

  if (user.passwordChangedAfter(payload.iat)) {
    return next(new AppError("Please Login in again with new password", 401));
  }

  req.user = user;
  next();
});

exports.restrictTo =
  (...roles) =>
  (req, res, next) => {
    const user = req.user;
    if (!roles.includes(user.role)) {
      return next(new AppError("Access Forbidden", 403));
    }
    next();
  };

exports.deleteMyAccount = catchAsync(async (req, res, next) => {
  const { password } = req.body;

  const user = req.user;

  console.log(user.password);

  if (!user.correctPassword(password, user.password)) {
    return next(new AppError("Password is incorrect", 401));
  }

  user.status = "deactivated";
  await user.save({ validateBeforeSave: false });

  setCookiesAndResponse(user, res, 204);
});

exports.updateMyPassword = catchAsync(async (req, res, next) => {
  const { password, newPassword, newConfirmPassword } = req.body;

  if (!password || !newPassword || !newConfirmPassword) {
    return next(new AppError("Please Provide All required fields", 400));
  }

  if (password === newPassword) {
    return next(
      new AppError("New Password must be different from Old Password", 400)
    );
  }

  const user = req.user;

  if (!(await user.correctPassword(password, user.password))) {
    return next(new AppError("Password is incorrect", 401));
  }

  user.password = newPassword;
  user.confirmPassword = newConfirmPassword;

  await user.save();

  setCookiesAndResponse(user, res, 202);
});

exports.updateMyEmail = catchAsync(async (req, res, next) => {
  const { password, newEmail } = req.body;

  if (!password || !newEmail) {
    return next(new AppError("Please provide all required fields", 400));
  }

  const user = req.user;

  if (!(await user.correctPassword(password, user.password))) {
    return next(new AppError("Password is incorrect", 401));
  }

  if (!validator.isEmail(newEmail)) {
    return next(new AppError("Email format is invalid", 400));
  }

  const verificationToken = user.createVerificationToken();
  user.email = newEmail;
  user.status = "not-verified";

  await user.save({ validateBeforeSave: false });

  sendEmail(
    [user.email],
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
            <p>Please click on the link to verify your eamil ${
              user.email
            } on skilly.com</p>
            <a href="${req.protocol}://${req.get(
      "host"
    )}/api/v1/users/verifyUser/${verificationToken}">Click Here</a>
        </body>
        </html>`
  );

  res.status(202).json({
    status: "success",
    message:
      "Email changed successfully and verification link is sent to new email",
  });
});

exports.updateMe = catchAsync(async (req, res, next) => {
  const { name, photo } = req.body;

  const user = req.user;

  user.photo = photo;
  user.name = name;

  await user.save({ validateBeforeSave: false });

  user.password = undefined;
  user.verifyAccountToken = undefined;
  user.resetPasswordToken = undefined;
  user.resetTokenExpires = undefined;

  res.status(202).json({
    status: "success",
    data: {
      user,
    },
  });
});

exports.myProfile = (req, res, next) => {
  req.params.id = req.user._id;
  next();
};
