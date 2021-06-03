const express = require("express");

const authController = require("../controller/authController");
const factoryController = require("../controller/factoryController");
const categorycontroller = require("../controller/categoryController");

const Category = require("../model/courseCategoryModel");

const router = express.Router();

router.use(authController.protect);

router
  .route("/")
  .get(factoryController.getAll(Category))
  .post(
    authController.restrictTo("admin", "instructor"),
    categorycontroller.createSlug,
    factoryController.create(Category)
  );

router
  .route("/:id")
  .get(factoryController.getOne(Category))
  .patch(
    authController.restrictTo("admin"),
    categorycontroller.createSlug,
    factoryController.updateOneById(Category)
  )
  .delete(
    authController.restrictTo("admin"),
    factoryController.deleteOne(Category)
  );

router.get("/:slug", factoryController.getOneBySlug(Category));

module.exports = router;
