const express = require("express");
const path = require("path");

const lectureController = require(path.resolve("controller/lectureController"));
const authController = require(path.resolve("controller/authController"));
const mediaController = require(path.resolve("controller/mediaController"));

const router = express.Router();

router.use("/users", express.static("uploads/users"));

router.use(
  "/:imageType/:imageName/:width/:height",
  mediaController.resizeImages
);

router.use(
  "/:id/lectures/:lectureFileName",
  lectureController.gettingCourseData,
  lectureController.checkingLecture,
  lectureController.checkForLockedLectures,
  authController.protect,
  lectureController.checkingAccessToLectures,
  lectureController.sendingLectureToClient
);

router.use(
  "/download/:id/lectures/:lectureFileName",
  lectureController.gettingCourseData,
  lectureController.checkingLecture,
  lectureController.checkForLockedLecturesAndDownload,
  authController.protect,
  lectureController.checkingAccessToLectures,
  lectureController.downloadLectureToClient
);

module.exports = router;
