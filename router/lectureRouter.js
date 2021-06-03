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
