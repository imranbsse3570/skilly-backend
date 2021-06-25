const mongoose = require("mongoose");

const Course = require("./courseModel");

const reviewSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
  },
  course: {
    type: mongoose.Schema.ObjectId,
    ref: "Course",
  },
  content: {
    type: String,
    required: [true, "Content of reivew is required"],
  },
  title: {
    type: String,
    required: [true, "Title of the Review is required"],
  },
  rating: {
    type: Number,
    required: [true, "Rating is required"],
    min: 1,
    max: 5,
    default: 2.5,
  },
  createdAt: {
    type: Date,
    default: new Date(Date.now()),
  },
});

reviewSchema.index({ course: 1, author: 1 }, { unique: true });

reviewSchema.statics.calculateAverageRating = async function (courseId) {
  const reviewAverage = await this.aggregate([
    {
      $match: { course: courseId },
    },
    {
      $group: {
        _id: null,
        ratings: { $avg: "$rating" },
        noOfReviews: { $sum: 1 },
      },
    },
  ]);

  if (reviewAverage.length > 0) {
    await Course.findByIdAndUpdate(courseId, {
      rating: reviewAverage[0].ratings,
      noOfReviews: reviewAverage[0].noOfReviews,
    });
  } else {
    await Course.findByIdAndUpdate(courseId, {
      rating: 1,
      noOfReviews: 0,
    });
  }
};

reviewSchema.post("save", function () {
  Review.calculateAverageRating(this.course);
});

reviewSchema.pre(/^findOneAnd/, async function (next) {
  this.reviewChanged = await this.findOne();
  next();
});

reviewSchema.post(/^findOneAnd/, function () {
  Review.calculateAverageRating(this.reviewChanged.course);
});

reviewSchema.pre("find", function (next) {
  this.populate({ path: "author", select: "name email" }).populate({
    path: "course",
  });
  next();
});

const Review = mongoose.model("Review", reviewSchema);

module.exports = Review;
