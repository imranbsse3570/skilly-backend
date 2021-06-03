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
  course: {
    type: mongoose.Schema.ObjectId,
    ref: "Course",
  },
  numOfReplies: {
    type: Number,
    default: 0,
  },
  // lecture: {
  //   type: mongoose.Schema.ObjectId,
  //   ref: "Lecture",
  // },
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
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
  },
  isSolved: {
    type: Boolean,
    default: false,
  },
});

questionSchema.pre(/^find/, function (next) {
  this.populate({ path: "user" }).populate({
    path: "replies",
  });
  next();
});

const Question = mongoose.model("Question", questionSchema);

module.exports = Question;
