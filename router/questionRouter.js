const express = require("express");

const Question = require("../model/questionModel");
const Course = require("../model/courseModel");

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

router
  .route("/:questionId")
  .get(questionController.settingsParams, factoryController.getOne(Question))
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
