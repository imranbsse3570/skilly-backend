const express = require("express");

const authController = require("../controller/authController");
const quizController = require("../controller/quizController");
const factoryController = require("../controller/factoryController");
const Course = require("../model/courseModel");

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
