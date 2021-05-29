const Answer = require("../model/answerModel");

const AppError = require("../util/appError");
const catchAsync = require("../util/catchAsync");

exports.settingsParams = (req, res, next) => {
  req.params.id = req.params.questionId;
  next();
};

exports.checkUserValidity = catchAsync(async (req, res, next) => {
  if (!req.user.courses.includes(req.params.id)) {
    return next(new AppError("Restricted access to course", 403));
  }

  req.body.user = req.user._id;
  req.body.course = req.params.id;
  next();
});

exports.checkForAuthorOfQuestion = (req, res, next) => {
  const question = req.document;
  if (question.user._id.toString() !== req.user._id.toString()) {
    next(
      new AppError(
        "Only Author of the question is allowed to change the question",
        403
      )
    );
  }

  next();
};

exports.updatingQuestion = catchAsync(async (req, res, next) => {
  const question = req.document;

  question.body = req.body.body || question.body;
  question.isSolved = req.body.isSolved || question.isSolved;

  await question.save();

  res.status(202).json({
    status: "success",
    data: {
      question,
    },
  });
});

exports.deleteQuestion = catchAsync(async (req, res, next) => {
  const question = req.document;

  question.replies.forEach(async (answer) => {
    await Answer.findByIdAndDelete(answer);
  });

  await question.remove();

  res.status(204).json({
    status: "success",
  });
});
