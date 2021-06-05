const path = require("path");

const catchAsync = require(path.resolve("util/catchAsync"));
const Category = require(path.resolve("model/courseCategoryModel"));
const generateUniqueSlug = require(path.resolve("util/generateUniqueSlug"));
const AppError = require(path.resolve("util/appError"));

exports.createSlug = catchAsync(async (req, res, next) => {
  const { title } = req.body;
  const categories = await Category.find({ title });

  if (categories.length > 0) {
    return next(new AppError("Category Already exists", 400));
  }

  req.body.slug = generateUniqueSlug(categories, title);
  next();
});
