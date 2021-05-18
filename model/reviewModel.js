const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
  },
  courseId: {
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

reviewSchema.pre(/^find/, function (next) {
  this.populate({ path: userId }).populate({ path: courseId });
  next();
});

const Review = mongoose.model("Review", reviewSchema);

module.exports = Review;
