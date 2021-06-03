const mongoose = require("mongoose");

const lectureSchema = new mongoose.Schema({
  order: {
    type: Number,
  },
  title: {
    type: String,
    required: [true, "Lecture title is required"],
  },
  description: {
    type: String,
    required: [true, "Lecture Description is Required"],
  },
  duration: {
    type: Number,
  },
  caption: {
    type: String,
  },
  source: {
    type: String,
    required: [true, "Video source is required"],
    unique: [true, "Source of the video must be unique"],
  },
  isLocked: {
    type: Boolean,
    default: true,
  },
});

lectureSchema.index({ order: -1 });

const Lecture = mongoose.model("Lecture", lectureSchema);

module.exports = Lecture;
