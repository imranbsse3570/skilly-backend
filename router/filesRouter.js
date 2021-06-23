const express = require("express");

const lectureController = require("./../controller/lectureController");
const authController = require("./../controller/authController");
const mediaController = require("./../controller/mediaController");

const router = express.Router();

router.get("/:imageType/:imageName", mediaController.resizeImages);

router.get(
  "/:id/lectures/:lectureFileName",
  lectureController.gettingCourseData,
  lectureController.checkingLecture,
  lectureController.checkForLockedLectures,
  authController.protect,
  lectureController.checkingAccessToLectures,
  lectureController.sendingLectureToClient
);

router.get(
  "/download/:id/lectures/:lectureFileName",
  lectureController.gettingCourseData,
  lectureController.checkingLecture,
  lectureController.checkForLockedLecturesAndDownload,
  authController.protect,
  lectureController.checkingAccessToLectures,
  lectureController.downloadLectureToClient
);

module.exports = router;
