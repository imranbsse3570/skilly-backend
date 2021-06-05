const express = require("express");
const path = require("path");

const courseController = require(path.resolve("controller/courseController"));
const authController = require(path.resolve("controller/authController"));
const factoryController = require(path.resolve("controller/factoryController"));
const paymentController = require(path.resolve("controller/paymentController"));
const Course = require(path.resolve("model/courseModel"));

const reviewRouter = require(path.resolve("router/reviewRouter"));
const lectureRouter = require(path.resolve("router/lectureRouter"));
const questionRouter = require(path.resolve("router/questionRouter"));
const quizRouter = require(path.resolve("router/quizRouter"));

const router = express.Router();

router.use("/:courseId/reviews", reviewRouter);
router.use("/:id/lectures", lectureRouter);

router.get("/", factoryController.getAll(Course));
router.get("/:id", factoryController.getOne(Course));

router.use(authController.protect);

router.get(
  "/:courseId/checkout",
  paymentController.checkingUserValidityForCheckout,
  paymentController.createCheckoutSession
);

router.use("/:id/quizs", quizRouter);

router.use("/:id/questions", questionRouter);

router.get(
  "/:id/generateCertificate",
  factoryController.checkDocument(Course),
  courseController.generateCertificate
);

// router.get("/:courseId/payout", paymentController.handlePaymentToInstructor);

router.use(authController.restrictTo("instructor", "admin"));

router.post(
  "/",
  courseController.addNewCourse,
  factoryController.create(Course)
);

router
  .route("/:id")
  .delete(
    factoryController.validateUser(Course),
    factoryController.deleteOne(Course)
  )
  .patch(
    factoryController.validateUser(Course),
    courseController.updateCourse,
    factoryController.updateOne(Course)
  );

module.exports = router;
