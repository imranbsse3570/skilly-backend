const express = require("express");

const factoryController = require("./../controller/factoryController");
const Answer = require("./../model/answerModel");
const answerController = require("./../controller/answerController");

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
