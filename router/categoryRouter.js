const express = require("express");

const authController = require("./../controller/authController");
const factoryController = require("./../controller/factoryController");
const categoryController = require("./../controller/categoryController");

const Category = require("./../model/courseCategoryModel");

const router = express.Router();

router.use(authController.protect);

router
  .route("/")
  .get(factoryController.getAll(Category))
  .post(
    authController.restrictTo("admin", "instructor"),
    categoryController.uploadCategoryPreviewImage.single("previewImage"),
    categoryController.createSlug,
    categoryController.reFormatPicture,
    factoryController.create(Category)
  );

router
  .route("/:id")
  .get(factoryController.getOne(Category))
  .patch(
    authController.restrictTo("admin"),
    categoryController.uploadCategoryPreviewImage.single("previewImage"),
    categoryController.createSlug,
    categoryController.reFormatPicture,
    factoryController.updateOneById(Category)
  )
  .delete(
    authController.restrictTo("admin"),
    factoryController.deleteOne(Category)
  );

router.get("/:slug", factoryController.getOneBySlug(Category));

module.exports = router;
