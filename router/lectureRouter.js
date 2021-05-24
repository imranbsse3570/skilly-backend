const express = require("express");

const authController = require("../controller/authController");
const lectureController = require("../controller/lectureController");
const factoryController = require("../controller/factoryController");
const Lecture = require("../model/lectureModel");
const Course = require("../model/courseModel");

const router = express.Router({ mergeParams: true });

router
  .route("/")
  .get(lectureController.gettingCourseData, lectureController.getLectures)
  .post(
    authController.protect,
    authController.restrictTo("admin", "instructor"),
    factoryController.validateUser(Course),
    lectureController.lectureUploader.single("lectureVideo"),
    lectureController.addNewLectures
  );

router.route("/:id").get(lectureController.gettingCourseData).patch().delete();

module.exports = router;
