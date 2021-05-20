const express = require("express");
const reviewController = require("../controller/reviewController");
const authController = require("../controller/authController");
const factoryController = require("../controller/factoryController");

const Review = require("../model/reviewModel");

const router = express.Router({ mergeParams: true });

router
  .route("/")
  .get(reviewController.checkForCourse, factoryController.getAll(Review))
  .post(
    authController.protect,
    authController.restrictTo("student"),
    reviewController.checkForCourse,
    reviewController.updatingRequestBody,
    factoryController.create(Review)
  );

router
  .route("/:id")
  .get(factoryController.getOne(Review))
  .delete(
    authController.protect,
    authController.restrictTo("student", "admin"),
    reviewController.checkForCourse,
    factoryController.validateUser(Review),
    factoryController.deleteOne(Review)
  )
  .patch(
    authController.protect,
    authController.restrictTo("student", "admin"),
    reviewController.checkForCourse,
    factoryController.validateUser(Review),
    reviewController.checkValidUser,
    factoryController.updateOne(Review)
  );

module.exports = router;
