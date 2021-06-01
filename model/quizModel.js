const mongoose = require("mongoose");

const quizSchema = new mongoose.Schema({
  questions: {
    type: [
      {
        question: {
          type: String,
          unique: [true, "Every Question Must be unique"],
          required: [true, "Question is required"],
        },
        correctAnswer: {
          type: String,
          required: [true, "Correct Answer is required"],
        },
        incorrectAnswers: [
          {
            type: String,
            required: [true, "At least 3 Options are required"],
            validator: {
              validate: function () {
                return this.incorrectAnswers.length >= 3;
              },
              message: "Atleast 3 options are required",
            },
          },
        ],
      },
    ],
    validate: {
      validator: function () {
        return this.questions.length >= 40;
      },
      message: "There must be al least 40 questions",
    },
  },
});

module.exports = quizSchema;
