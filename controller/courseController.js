const catchAsync = require("../util/catchAsync");
const Course = require("../model/CourseModel");
const generateSlug = require("../util/generateUniqueSlug");

exports.addNewCourse = catchAsync(async (req, res, next) => {
  const { title } = req.body;
  const courses = await Course.find({ title });
  req.body.slug = generateSlug(courses, title);
  req.body.author = req.user._id;
  next();
});

exports.updateCourse = catchAsync(async (req, res, next) => {
  if (req.body.title) {
    const { title } = req.body;
    const courses = await Course.find({ title });
    req.body.slug = generateSlug(courses, title);
  }

  delete req.body.noOfReviews;
  delete req.body.rating;
  delete req.body.totalDuration;
  delete req.body.category;

  next();
});
