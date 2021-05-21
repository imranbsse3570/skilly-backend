const catchAsync = require("../util/catchAsync");
const Lecture = require("../model/lectureModel");
const Course = require("../model/courseModel");
const AppError = require("../util/appError");
const APIFeatures = require("../util/apiFeatures");

exports.gettingCourseData = catchAsync(async (req, res, next) => {
  const course = await Course.findById(req.params.courseId);
  if (!course) {
    return next(new AppError("Course Not found", 404));
  }
  req.course = course;
  next();
});

exports.getLectures = catchAsync(async (req, res, next) => {
  const lectures = req.course.lectures;

  lectures.forEach((value) => {
    if (value.isLocked) {
      value.source = undefined;
    }
  });

  res.status(200).json({
    status: "success",
    results: lectures.length,
    data: {
      doc: lectures,
    },
  });
});

exports.addNewLectures = catchAsync(async (req, res, next) => {
  const newLecture = await Lecture.create(req.body);

  course.lectures = [...req.document.lectures, newLecture._id];
  await course.save({ validateBeforeSave: false });

  res.status(201).json({
    status: "success",
    data: {
      doc: newLecture,
    },
  });
});

exports.getLectureById = (req, res, next) => {
  const lecture = req.course.lecturesfilter(
    (value) => value._id === req.params.id
  );

  if (lecture) {
    res.status(200).json({
      status: "success",
      data: {
        doc: lecture,
      },
    });
  } else {
    next(new AppError("Lecture Not Found", 404));
  }
};
