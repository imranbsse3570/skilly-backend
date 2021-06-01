const mongoose = require("mongoose");

const quizSchema = new mongoose.Schema({
  questions: [
    {
      question: {
        type: String,
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
              return this.incorrectAnswers.length > 3;
            },
            message: "Atleast 3 options are required",
          },
        },
      ],
    },
  ],
});

const Quiz = mongoose.model("Quiz", quizSchema);

module.exports = Quiz;
