const express = require("express");

const authController = require("./../controller/authController");
const factoryController = require("./../controller/factoryController");
const categoryController = require("./../controller/categoryController");

const Category = require("./../model/courseCategoryModel");

const router = express.Router();

router.get("/", categoryController.getAllCategories);

router.get("/:id", categoryController.getOneCategory);

router.get("/slug/:slug", categoryController.getOneByCategoryBySlug);

router.use(authController.protect);

router.post(
  "/",
  authController.restrictTo("admin", "instructor"),
  categoryController.uploadCategoryPreviewImage.single("previewImage"),
  categoryController.createSlug,
  categoryController.reFormatPicture,
  factoryController.create(Category)
);

router
  .route("/:id")
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

module.exports = router;
