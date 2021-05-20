const mongoose = require("mongoose");

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
    min: 1,
    max: 5,
  },
  price: {
    type: Number,
    required: [true, "Price is required"],
  },
  isPublished: {
    type: Boolean,
    default: false,
  },
  language: {
    type: String,
    enum: ["English", "Urdu", "German", "Dutch", "Italian", "Hindi", "Spanish"],
    default: "English",
  },
  image: {
    type: String,
  },
  totalDuration: {
    type: Number,
  },
  users: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
  ],
  lectures: [
    // {
    //   type: mongoose.Schema.ObjectId,
    //   ref: "Lecture",
    // },
  ],
  category: {
    type: mongoose.Schema.ObjectId,
    ref: "Category",
  },
  slug: {
    type: String,
    unique: true,
  },
});

courseSchema.pre(/^find/, function (next) {
  this.populate("users").populate("lectures").populate("category");
  next();
});

const Course = mongoose.model("Course", courseSchema);

module.exports = Course;
