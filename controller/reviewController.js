const catchAsync = require("../util/catchAsync");
const AppError = require("../util/appError");
const Course = require("../model/courseModel");

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
