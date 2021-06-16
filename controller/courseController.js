const path = require("path");
const multer = require("multer");
const sharp = require("sharp");

const catchAsync = require("./../util/catchAsync");
const Course = require("../model/courseModel");
const generateSlug = require("./../util/generateUniqueSlug");
const checkingForMatchingCourse = require("./../util/findingCourseInUser");
const AppError = require("./../util/appError");
const generatePdf = require("./../util/generatePdf");

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new AppError("File type not supported please upload an image", 400));
  }
};

exports.uploadCoursePreviewImage = multer({
  storage,
  fileFilter,
});

exports.reFormatPicture = catchAsync(async (req, res, next) => {
  if (req.file) {
    req.body.previewImage = `lecture-preview-${
      req.body.slug
    }-${Date.now()}.png`;
    await sharp(req.file.buffer)
      .png()
      .toFile(`uploads/lectureCoverImages/${req.body.previewImage}`);
  }
  next();
});

exports.addNewCourse = catchAsync(async (req, res, next) => {
  console.log(req.body);
  const { title } = req.body;
  const courses = await Course.find({ title });
  req.body.slug = generateSlug(courses, title);
  console.log("completed at this point");
  req.body.author = req.user._id;
  next();
});

exports.updateCourse = catchAsync(async (req, res, next) => {
  if (req.body.title) {
    const { title } = req.body;
    const courses = await Course.find({ title });
    req.body.slug = generateSlug(courses, title);
  } else {
    req.body.slug = req.document.slug;
  }

  delete req.body.noOfReviews;
  delete req.body.rating;
  delete req.body.totalDuration;
  delete req.body.category;
  delete req.body.author;

  next();
});

exports.generateCertificate = catchAsync(async (req, res, next) => {
  const user = req.user;
  const course = req.document;

  const courseDetail = checkingForMatchingCourse(user.courses, course._id);

  if (!courseDetail) {
    return next(new AppError("Please purchase this course", 403));
  }

  if (courseDetail.score <= 12) {
    return next(
      new AppError(
        "Please Give the quiz and get atleast 13 marks to get certified",
        403
      )
    );
  }

  const date = new Date(Date.now());

  const minutes = parseInt(course.totalDuration / 60);
  const hours = parseInt(minutes / 60);

  const durationString = `${
    hours > 0 ? hours + "hours " : ""
  }${minutes} minutes`;

  const pdf = await generatePdf("resources/certificate.html", {
    name: user.name,
    courseName: course.title,
    duration: durationString,
    marks: courseDetail.score,
    author: course.author.name,
    date: `${date.getDate() > 10 ? date.getDate : "0" + date.getDate()} / ${
      date.getMonth() + 1
    } / ${date.getFullYear()}`,
  });

  res.writeHead(200, {
    "Content-Type": "application/pdf",
  });

  res.end(pdf);
});
