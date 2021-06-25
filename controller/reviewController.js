const Review = require("../model/reviewModel");
const catchAsync = require("./../util/catchAsync");

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

exports.getReviewsForHomepage = catchAsync(async (req, res, next) => {
  const reviews = await Review.find({ rating: 5 }).limit(8);

  res.status(200).json({
    status: "success",
    results: reviews.length,
    data: {
      reviews,
    },
  });
});
