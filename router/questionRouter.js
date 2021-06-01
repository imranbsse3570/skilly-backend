const express = require("express");

const Question = require("../model/questionModel");
const Course = require("../model/courseModel");

const answerRouter = require("../router/answerRouter");

const questionController = require("../controller/questionController");
const factoryController = require("../controller/factoryController");

const router = express.Router({ mergeParams: true });

router.use(factoryController.checkDocument(Course));

router
  .route("/")
  .get(factoryController.getAll(Question))
  .post(
    questionController.checkUserValidity,
    factoryController.create(Question)
  );

router.get(
  "/:questionId",
  questionController.settingsParams,
  factoryController.getOne(Question)
);

router.use(
  "/:questionId/answers",
  questionController.settingParamsById,
  factoryController.checkDocumentById(Question),
  answerRouter
);

router
  .route("/:questionId")
  .patch(
    questionController.settingsParams,
    factoryController.checkDocument(Question),
    questionController.checkForAuthorOfQuestion,
    questionController.updatingQuestion
  )
  .delete(
    questionController.settingsParams,
    factoryController.checkDocument(Question),
    questionController.checkForAuthorOfQuestion,
    questionController.deleteQuestion
  );

module.exports = router;
