const express = require("express");
const path = require("path");

const { settingsParams } = require(path.resolve(
  "controller/questionController"
));
const factoryController = require(path.resolve("controller/factoryController"));
const Answer = require(path.resolve("model/answerModel"));
const Question = require(path.resolve("model/questionModel"));
const answerController = require(path.resolve("controller/answerController"));

const router = express.Router({ mergeParams: true });

router
  .route("/")
  .get(factoryController.getAll(Answer))
  .post(answerController.saveUserId, answerController.createAnswer);

router
  .route("/:answerId")
  .get(answerController.settingParams, factoryController.getOne(Answer))
  .patch(
    answerController.settingParams,
    factoryController.checkDocument(Answer),
    answerController.matchAuthorOfAnswer,
    answerController.updateAnswer
  )
  .delete(
    answerController.preserveQuestion,
    answerController.settingParams,
    factoryController.checkDocument(Answer),
    answerController.matchAuthorOfAnswer,
    answerController.deleteAnswer
  );

module.exports = router;
