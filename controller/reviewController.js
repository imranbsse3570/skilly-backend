const catchAsync = require("../util/catchAsync");
const AppError = require("../util/appError");
const Course = require("../model/CourseModel");
const Review = require("../model/reviewModel");

exports.checkForCourse = catchAsync(async (req, res, next) => {
  const course = await Course.findById(req.params.courseId);
  if (!course) return next(new AppError("Course Not Found", 404));
  next();
});

exports.updatingRequestBody = catchAsync(async (req, res, next) => {
  req.body.course = req.params.courseId;
  req.body.author = req.user._id;
  next();
});

exports.checkValidUser = catchAsync(async (req, res, next) => {
  req.body.author = req.user._id;
  req.body.course = req.params.courseId;

  next();
});
