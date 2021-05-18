const mongoose = require("mongoose");

const lectureSchema = new mongoose.Schema({
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
  watchedTime: {
    type: Number,
    validate: {
      validator: function () {
        return this.watchedTime <= this.duration;
      },
      message: "Watched Time must be less than or equal to duration of lecture",
    },
  },
  watched: {
    type: Boolean,
    default: false,
  },
  caption: {
    type: String,
  },
  source: {
    type: String,
    required: [true, "Video source is required"],
  },
});

const Lecture = mongoose.model("Lecture", lectureSchema);

module.exports = Lecture;
