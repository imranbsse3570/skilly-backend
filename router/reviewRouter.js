const express = require("express");
const reviewController = require("../controller/reviewController");
const authController = require("../controller/authController");
const factoryController = require("../controller/factoryController");

const Review = require("../model/reviewModel");

const router = express.Router({ mergeParams: true });

router
  .route("/")
  .get(factoryController.checkForCourse, factoryController.getAll(Review))
  .post(
    authController.protect,
    authController.restrictTo("student"),
    factoryController.checkForCourse,
    reviewController.updatingRequestBody,
    factoryController.create(Review)
  );

router
  .route("/:id")
  .get(factoryController.checkForCourse, factoryController.getOne(Review))
  .delete(
    authController.protect,
    authController.restrictTo("student", "admin"),
    factoryController.checkForCourse,
    factoryController.validateUser(Review),
    factoryController.deleteOne(Review)
  )
  .patch(
    authController.protect,
    authController.restrictTo("student", "admin"),
    factoryController.checkForCourse,
    factoryController.validateUser(Review),
    reviewController.checkValidUser,
    factoryController.updateOne(Review)
  );

module.exports = router;
