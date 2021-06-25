const express = require("express");

const catchAsync = require("../util/catchAsync");
const Course = require("../model/courseModel");
const User = require("../model/userModel");
const Category = require("../model/courseCategoryModel");

const router = express.Router();

router.get(
  "/",
  catchAsync(async (req, res, next) => {
    const courses = await Course.aggregate([{ $count: "courses" }]);

    const instructors = await User.aggregate([
      { $match: { role: "instructor" } },
      { $count: "instructors" },
    ]);

    const students = await User.aggregate([
      { $match: { role: "student" } },
      { $count: "students" },
    ]);

    const categories = await Category.aggregate([{ $count: "categories" }]);

    const data = [
      {
        number: courses[0].courses,
        text: "Amazing Courses",
      },
      {
        number: instructors[0].instructors,
        text: "Top Instructor",
      },
      {
        number: students[0].students,
        text: "Skilled Students",
      },
      {
        number: categories[0].categories,
        text: "Categories",
      },
    ];

    res.status(200).json({
      status: "success",
      data: {
        stats: data,
      },
    });
  })
);

module.exports = router;
