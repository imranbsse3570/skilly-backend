const express = require("express");
const courseController = require("../controller/courseController");
const authController = require("../controller/authController");
const factoryController = require("../controller/factoryController");
const paymentController = require("../controller/paymentController");
const Course = require("../model/courseModel");

const reviewRouter = require("../router/reviewRouter");
const lectureRouter = require("../router/lectureRouter");
const questionRouter = require("../router/questionRouter");

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

router.use("/:id/questions", questionRouter);

// router.get("/:courseId/payout", paymentController.handlePaymentToInstructor);

router.use(authController.restrictTo("instructor", "admin"));

router.post(
  "/",
  courseController.addNewCourse,
  factoryController.create(Course),
  factoryController.validateUser(Course)
);

router
  .route("/:id")
  .delete(factoryController.deleteOne(Course))
  .patch(courseController.updateCourse, factoryController.updateOne(Course));

module.exports = router;
