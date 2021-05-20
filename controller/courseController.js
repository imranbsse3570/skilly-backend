const catchAsync = require("../util/catchAsync");
const Course = require("../model/CourseModel");
const generateSlug = require("../util/generateUniqueSlug");

exports.addNewCourse = catchAsync(async (req, res, next) => {
  const { title } = req.body;
  const courses = await Course.find({ title });
  req.body.slug = generateSlug(courses, title);
  next();
});

exports.getCourse = (req, res, next) => {
  req.params.id = req.params.courseId;
  next();
};

exports.deleteCourse = (req, res, next) => {
  req.params.id = req.params.courseId;
  next();
};

exports.updateCourse = catchAsync(async (req, res, next) => {
  if (req.body.title) {
    const { title } = req.body;
    const courses = await Course.find({ title });
    req.body.slug = generateSlug(courses, title);
  }

  req.params.id = req.params.courseId;
  next();
});
