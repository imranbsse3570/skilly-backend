const express = require("express");
const courseController = require("../controller/courseController");
const authController = require("../controller/authController");
const factoryController = require("../controller/factoryController");
const Course = require("../model/CourseModel");

const router = express.Router();

router
  .route("/")
  .get(factoryController.getAll(Course))
  .post(courseController.addNewCourse, factoryController.create(Course));

router
  .route("/:courseId")
  .get(courseController.getCourse, factoryController.getOne(Course))
  .delete(courseController.deleteCourse, factoryController.deleteOne(Course))
  .patch(courseController.updateCourse, factoryController.updateOne(Course));

module.exports = router;
