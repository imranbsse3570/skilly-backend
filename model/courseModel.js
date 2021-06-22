const mongoose = require("mongoose");

const Quiz = require("./quizModel");

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Course Title is required"],
  },
  description: {
    type: String,
    required: [true, "Course Description is required"],
  },
  summary: {
    type: String,
    required: [true, "Course Summary is required"],
  },
  requirements: {
    type: String,
    required: [true, "Course Requirement is required"],
  },
  createdAt: {
    type: Date,
    default: new Date(Date.now()),
  },
  noOfReviews: {
    type: Number,
    default: 0,
  },
  rating: {
    type: Number,
    default: 1,
    min: [1, "Minimum Review must be 1"],
    max: [5, "Maximum review must be 5"],
    set: (value) => Math.round(value * 10) / 10,
  },
  price: {
    type: Number,
    required: [true, "Price is required"],
  },
  isPublished: {
    type: Boolean,
    default: false,
  },
  languages: [
    {
      type: String,
      enum: [
        "English",
        "Urdu",
        "German",
        "Dutch",
        "Italian",
        "Hindi",
        "Spanish",
      ],
      default: "English",
    },
  ],
  image: {
    type: String,
  },
  totalDuration: {
    type: Number,
    default: 0,
  },
  author: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
  },
  lectures: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "Lecture",
    },
  ],
  category: {
    type: mongoose.Schema.ObjectId,
    ref: "Category",
    required: true,
  },
  requirements: [
    {
      type: String,
      unique: true,
    },
  ],
  objectives: [
    {
      type: String,
      unique: true,
    },
  ],
  slug: {
    type: String,
    unique: true,
  },
  quiz: {
    type: Quiz,
    ref: "Quiz",
  },
  previewImage: {
    type: String,
    default: "default.jpg",
  },
});

courseSchema.index({ price: -1 });
courseSchema.index({ rating: 1 });
courseSchema.index({ totalDuration: 1 });
courseSchema.index(
  { price: -1, rating: 1 },
  {
    unique: true,
  }
);

courseSchema.pre(/^find/, function (next) {
  this.populate("author").populate("lectures").populate("category");
  next();
});

const Course = mongoose.model("Course", courseSchema);

module.exports = Course;
