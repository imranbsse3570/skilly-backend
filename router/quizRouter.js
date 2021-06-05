const express = require("express");
const path = require("path");

const authController = require(path.resolve("controller/authController"));
const quizController = require(path.resolve("controller/quizController"));
const factoryController = require(path.resolve("controller/factoryController"));
const Course = require(path.resolve("model/courseModel"));

const router = express.Router({ mergeParams: true });

router.get(
  "/startQuiz",
  factoryController.checkDocument(Course),
  factoryController.checkingUserHavePurchasedCourse,
  quizController.quizQuestions
);

router.post(
  "/submitQuiz",
  factoryController.checkDocument(Course),
  factoryController.checkingUserHavePurchasedCourse,
  quizController.submitQuestion
);

router.use(
  authController.restrictTo("instructor", "admin"),
  factoryController.validateUser(Course)
);

router
  .route("/")
  .get(quizController.getQuizForInstructorOrAuthor)
  .post(quizController.addNewQuiz)
  .delete(quizController.deleteQuiz)
  .put(quizController.updateQuiz);

module.exports = router;
