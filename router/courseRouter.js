const express = require("express");
const courseController = require("../controller/courseController");

const router = express.Router();

router
  .route("/")
  .get(courseController.getAllCourses)
  .post(courseController.addNewCourse);

router
  .route("/:id")
  .get(courseController.getCourse)
  .delete(courseController.deleteCourse)
  .patch(courseController.updateCourse);

module.exports = router;
