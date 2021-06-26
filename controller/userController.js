const User = require("./../model/userModel");
const APIFeatures = require("./../util/apiFeatures");
const catchAsync = require("./../util/catchAsync");
const AppError = require("./../util/appError");

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(User.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const users = await features.query;

  res.status(200).json({
    status: "Success",
    results: users.length,
    data: { users },
  });
});

exports.addNewUser = (req, res) => {
  res.status(404).json({
    status: "fail",
    message: "for creating new user v1/api/users/signup",
  });
};

exports.getUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id).populate({
    path: "courses.courseId",
  });
  if (!user) {
    return next(new AppError("User not found", 404));
  }

  res.status(200).json({
    status: "Success",
    data: { user },
  });
});

exports.deleteUser = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    {
      status: "deactivated",
    },
    {
      new: true,
    }
  );

  if (!user) {
    return next(new AppError("User not Found", 404));
  }

  res.status(204).json({
    status: "Success",
  });
});

exports.reactivateUser = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    {
      status: "verified",
    },
    {
      new: true,
    }
  );

  if (!user) {
    return next(new AppError("User not Found", 404));
  }

  res.status(202).json({
    status: "success",
    data: { user },
  });
});
