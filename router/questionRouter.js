const express = require("express");
const path = require("path");

const Question = require(path.resolve("model/questionModel"));
const Course = require(path.resolve("model/courseModel"));

const answerRouter = require(path.resolve("router/answerRouter"));

const questionController = require(path.resolve(
  "controller/questionController"
));
const factoryController = require(path.resolve("controller/factoryController"));

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
