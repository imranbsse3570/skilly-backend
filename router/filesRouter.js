const express = require("express");

const lectureController = require("../controller/lectureController");
const authController = require("../controller/authController");
const mediaController = require("../controller/mediaController");

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
