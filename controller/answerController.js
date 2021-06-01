const Answer = require("../model/answerModel");
const AppError = require("../util/appError");
const catchAsync = require("../util/catchAsync");

exports.saveUserId = (req, res, next) => {
  req.body.user = req.user._id;
  next();
};

exports.settingParams = (req, res, next) => {
  req.params.id = req.params.answerId;
  next();
};

exports.matchAuthorOfAnswer = (req, res, next) => {
  if (req.document.user.toString() !== req.user._id.toString()) {
    return next(new AppError("Access Forbidden", 403));
  }
  next();
};

exports.deleteAnswer = catchAsync(async (req, res, next) => {
  const question = req.question;

  const answer = req.document;

  if (!question.replies.includes(answer._id)) {
    return next(new AppError("Answer is not found in this question", 404));
  }

  question.replies = question.replies.filter((item) => {
    return item.toString() !== answer._id.toString();
  });

  await answer.remove();

  await question.save();

  res.status(204).json({
    status: "success",
  });
});

exports.createAnswer = catchAsync(async (req, res, next) => {
  const question = req.document;
  const answer = await Answer.create(req.body);

  question.replies = [...question.replies, answer._id];

  await question.save();

  res.status(201).json({
    status: "success",
    data: {
      doc: answer,
    },
  });
});

exports.updateAnswer = catchAsync(async (req, res, next) => {
  const answer = req.document;

  answer.body = req.body.body;

  await answer.save();

  res.status(202).json({
    status: "success",
    data: {
      doc: answer,
    },
  });
});

exports.preserveQuestion = (req, res, next) => {
  req.question = req.document;
  next();
};
