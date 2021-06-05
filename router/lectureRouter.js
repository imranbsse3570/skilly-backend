const express = require("express");
const path = require("path");

const authController = require(path.resolve("controller/authController"));
const lectureController = require(path.resolve("controller/lectureController"));
const factoryController = require(path.resolve("controller/factoryController"));
const Lecture = require(path.resolve("model/lectureModel"));
const Course = require(path.resolve("model/courseModel"));

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

router
  .route("/:lectureId")
  .get(lectureController.gettingCourseData, lectureController.getLectureById)
  .patch(
    authController.protect,
    authController.restrictTo("admin", "instructor"),
    factoryController.validateUser(Course),
    lectureController.checkingForTheLectureInCourse,
    lectureController.lectureUploader.single("lectureVideo"),
    lectureController.updateLecture
  )
  .delete(
    authController.protect,
    authController.restrictTo("admin", "instructor"),
    factoryController.validateUser(Course),
    lectureController.deleteLecture
  );

router.patch(
  "/:lectureId/watched",
  authController.protect,
  lectureController.gettingCourseData,
  lectureController.markingVideoAsWatched
);

module.exports = router;
