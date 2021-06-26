const crypto = require("crypto");
const fs = require("fs");

const handlebars = require("handlebars");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const multer = require("multer");

const {
  cloudinaryUploader,
  cloudinaryDestroy,
} = require("./../util/cloudinaryUploader");
const User = require("./../model/userModel");
const sendEmail = require("./../util/sendEmail");
const catchAsync = require("./../util/catchAsync");
const AppError = require("./../util/appError");
const deleteFile = require("./../util/deleteFile");

const htmlFile = fs.readFileSync("resources/action.html", "utf-8");
const template = handlebars.compile(htmlFile);

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new AppError("File type not supported please upload an image", 400));
  }
};

exports.uploadProfilePicture = multer({
  storage,
  fileFilter,
});

exports.reFormatPicture = catchAsync(async (req, res, next) => {
  if (req.file) {
    const user = req.user;
    req.filename = `user-${user._id.toString()}-${Date.now()}`;

    await cloudinaryUploader(
      `uploads/users/${req.filename}`,
      req.file.buffer,
      "png"
    );
  }
  next();
});

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

  if (process.env.NODE_ENV === "production") {
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
  const { name, email, password, confirmPassword, role } = req.body;

  if (role === "admin") {
    return next(new AppError("You cannot login as admin", 403));
  }

  // creating new user
  const newUser = await User.create({
    name,
    email,
    password,
    confirmPassword,
    role,
  });

  // checking if user is created
  if (!newUser) {
    return next(new AppError("User Already Exists", 400));
  }

  // creating verification token
  const verificationToken = newUser.createVerificationToken();

  await newUser.save({ validateBeforeSave: false });

  const html = template({
    url: `${req.protocol}://${req.get(
      "host"
    )}/api/v1/users/verifyUser/${verificationToken}`,
    topMessage: "Please confirm your email address by clicking the link below.",
    bottomMessage:
      "We may need to send you critical information about our service and it is important that we have an accurate email address.",
    buttonText: "Confirm email address",
  });

  // sending verification mail to client
  sendEmail([newUser.email], "Verify Account", html, html);

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

  const html = template({
    url: `${req.protocol}://${req.get(
      "host"
    )}/api/v1/users/resetPassword/${resetToken}`,
    buttonText: "Reset Password",
    topMessage: "Please reset your password by clicking the link below.",
    bottomMessage:
      "Note: This link will expires in 60 minutes. After 60 minutes this link will no longer be working.",
  });

  sendEmail([user.email], "Reset Password Link Expires in 60 minutes", html);

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
    return next(
      new AppError(
        "Client Not Authenticated Please login to view this resource",
        401
      )
    );
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

  const html = template({
    url: `${req.protocol}://${req.get(
      "host"
    )}/api/v1/users/verifyUser/${verificationToken}`,
    topMessage: "Please confirm your email address by clicking the link below.",
    bottomMessage:
      "We may need to send you critical information about our service and it is important that we have an accurate email address.",
    buttonText: "Confirm email address",
  });

  sendEmail([user.email], "Verify Account", html);

  res.status(202).json({
    status: "success",
    message:
      "Email changed successfully and verification link is sent to new email",
  });
});

exports.updateMe = catchAsync(async (req, res, next) => {
  const {
    name,
    facebookLink,
    twitterLink,
    linkedInLink,
    youtubeLink,
    designation,
    role,
  } = req.body;

  const user = req.user;

  if (req.filename) {
    if (!user.photo.startsWith("default")) {
      await cloudinaryDestroy(`uploads/users/${user.photo}`);
    }

    const photo = req.filename;
    user.photo = photo;
  }

  user.name = name || user.name;
  user.designation = designation || user.designation;
  user.role = role || user.role;
  user.facebookLink = facebookLink || user.facebookLink;
  user.twitterLink = twitterLink || user.twitterLink;
  user.linkedInLink = linkedInLink || user.linkedInLink;
  user.youtubeLink = youtubeLink || user.youtubeLink;

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
