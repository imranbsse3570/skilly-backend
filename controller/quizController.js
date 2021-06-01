const AppError = require("../util/appError");
const catchAsync = require("../util/catchAsync");

exports.getQuizForInstructorOrAuthor = (req, res, next) => {
  const course = req.document;

  res.status(200).json({
    status: "success",
    data: {
      doc: course.quiz,
    },
  });
};

exports.addNewQuiz = catchAsync(async (req, res, next) => {
  const course = req.document;

  course.quiz = req.body;

  await course.save();

  res.status(201).json({
    status: "success",
    data: {
      doc: course.quiz,
    },
  });
});

exports.deleteQuiz = catchAsync(async (req, res, next) => {
  const course = req.document;

  course.quiz = undefined;

  await course.save();

  res.status(204).json({
    status: "success",
  });
});

exports.updateQuiz = catchAsync(async (req, res, next) => {
  const course = req.document;

  course.quiz = req.body;

  await course.save();

  res.status(202).json({
    status: "success",
    data: {
      doc: course.quiz,
    },
  });
});

exports.checkForQuizStart = (req, res, next) => {
  const user = req.user;

  if (!user.courses.includes(req.params.id)) {
    next(new AppError("Please Purchase this course", 403));
  }

  next();
};

function shuffle(array) {
  return array.sort(() => Math.random() - 0.5);
}

exports.quizQuestions = (req, res, next) => {
  const course = req.document;

  const questions = shuffle(course.quiz.questions);

  const quiz = questions.splice(0, 25).map((question) => {
    return {
      question: question.question,
      options: shuffle([...question.incorrectAnswers, question.correctAnswer]),
    };
  });

  res.status(200).json({
    status: "success",
    results: quiz.length,
    data: {
      doc: quiz,
    },
  });
};

exports.submitQuestion = (req, res, next) => {
  const course = req.document;

  const user = req.user;

  const answerSheet = course.quiz.questions.map((question) => {
    return {
      question: question.question,
      answer: question.correctAnswer,
    };
  });

  const score = 0;

  const userAnswers = req.body.questions;

  console.log(req.body);
};
