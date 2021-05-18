const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  createdAt: {
    type: Date,
    default: new Date(Date.now()),
  },
  body: {
    type: String,
    required: [true, "Body of the Question is required"],
  },
  courseId: {
    type: mongoose.Schema.ObjectId,
    ref: "Course",
  },
  numOfReplies: {
    type: Number,
    default: 0,
  },
  lectureId: {
    type: mongoose.Schema.ObjectId,
    ref: "Lecture",
  },
  replies: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "Answer",
    },
  ],
  title: {
    type: String,
    required: [true, "Title of the question is required"],
  },
  userId: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
  },
  isSolved: {
    type: Boolean,
    default: false,
  },
});

questionSchema.pre(/^find/, function (next) {
  this.populate({ path: "userId" }).populate({ path: "courseId" }).populate({
    path: "replies",
  });
  next();
});

const Question = mongoose.model("Question", questionSchema);

module.exports = Question;
