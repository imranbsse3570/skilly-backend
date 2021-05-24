const crypto = require("crypto");
const fs = require("fs");

const multer = require("multer");

const catchAsync = require("../util/catchAsync");
const Lecture = require("../model/lectureModel");
const Course = require("../model/courseModel");
const AppError = require("../util/appError");
const APIFeatures = require("../util/apiFeatures");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const { id } = req.params;

    fs.mkdir(`uploads/lectures/${id}`, { recursive: true }, (err) => {
      if (err) {
        cb(new AppError("Error in uploading File", 400));
      }
    });

    cb(null, `uploads/lectures/${id}`);
  },
  filename: (req, file, cb) => {
    const ext = file.mimetype.split("/")[1];
    const filenameWithExt = `${crypto
      .randomBytes(15)
      .toString("hex")}-${Date.now()}.${ext}`;
    cb(null, filenameWithExt);
  },
});

const fileFilter = (req, file, cb) => {
  console.log(file);
  if (file.mimetype.startsWith("video")) {
    if (file.mimetype.endsWith("mp4")) {
      cb(null, true);
    } else {
      cb(
        new AppError(
          "Video Format not valid. please only upload mp4 files",
          400
        )
      );
    }
  } else {
    cb(new AppError("Only video is accepted as upload", 400));
  }
};

exports.lectureUploader = multer({ storage: storage, fileFilter: fileFilter });

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
  if (!req.file) {
    next(
      new AppError(
        "Video file must be uploaded in order to create a lecture",
        404
      )
    );
  }

  req.body.source = req.file.filename;

  const newLecture = await Lecture.create(req.body);

  console.log(req.document);

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
