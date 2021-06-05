const AppError = require("./../util/appError");
const catchAsync = require("./../util/catchAsync");
const checkingForMatchingCourse = require("./../util/findingCourseInUser");

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

exports.submitQuestion = catchAsync(async (req, res, next) => {
  const course = req.document;

  if (req.body.questions < 25) {
    next(new AppError("Please Attempt all questions", 401));
  }

  const user = req.user;

  const answerSheet = {};
  course.quiz.questions.forEach((question) => {
    answerSheet[`${question.question}`] = question.correctAnswer;
  });

  let score = 0;

  const userAnswers = req.body.questions.splice(0, 25);

  userAnswers.forEach((question) => {
    if (question.answer === answerSheet[question.question]) {
      score++;
    }
  });

  const courseStats = checkingForMatchingCourse(user.courses, course._id);
  const courseIndex = user.courses.indexOf(courseStats);

  courseStats.score = score;

  user.courses[courseIndex] = courseStats;

  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    status: "success",
    message: `You got ${score}/25`,
    result: `${score > 12 ? "Pass" : "Fail"}`,
  });
});
