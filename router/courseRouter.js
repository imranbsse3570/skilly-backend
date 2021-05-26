const express = require("express");
const courseController = require("../controller/courseController");
const authController = require("../controller/authController");
const factoryController = require("../controller/factoryController");
const paymentController = require("../controller/paymentController");
const Course = require("../model/courseModel");

const reviewRouter = require("../router/reviewRouter");
const lectureRouter = require("../router/lectureRouter");
const AppError = require("../util/appError");

const router = express.Router();

router.use("/:courseId/reviews", reviewRouter);
router.use("/:id/lectures", lectureRouter);

router.get(
  "/:courseId/checkout",
  authController.protect,
  paymentController.checkingUserValidityForCheckout,
  paymentController.createCheckoutSession
);

// router.get("/:courseId/payout", paymentController.handlePaymentToInstructor);

router
  .route("/")
  .get(factoryController.getAll(Course))
  .post(
    authController.protect,
    authController.restrictTo("instructor", "admin"),
    courseController.addNewCourse,
    factoryController.create(Course)
  );

router
  .route("/:id")
  .get(factoryController.getOne(Course))
  .delete(
    authController.protect,
    authController.restrictTo("instructor", "admin"),
    factoryController.validateUser(Course),
    factoryController.deleteOne(Course)
  )
  .patch(
    authController.protect,
    authController.restrictTo("instructor", "admin"),
    factoryController.validateUser(Course),
    courseController.updateCourse,
    factoryController.updateOne(Course)
  );

module.exports = router;
