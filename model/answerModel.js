const mongoose = require("mongoose");

const answerSchema = new mongoose.Schema({
  body: {
    type: String,
    required: [true, "Body of the answer is required"],
  },
  createdAt: {
    type: Date,
    default: new Date(Date.now()),
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
  },
  isTopAnswer: {
    type: Boolean,
    default: false,
  },
});

answerSchema.pre(/^find/, function (next) {
  this.populate("userId");
  next();
});

const Answer = mongoose.model("Answer", answerSchema);

module.exports = Answer;
