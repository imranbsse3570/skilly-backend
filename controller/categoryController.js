const catchAsync = require("../util/catchAsync");
const Category = require("../model/courseCategoryModel");
const generateUniqueSlug = require("../util/generateUniqueSlug");
const AppError = require("../util/appError");

exports.createSlug = catchAsync(async (req, res, next) => {
  const { title } = req.body;
  const categories = await Category.find({ title });

  if (categories.length > 0) {
    return next(new AppError("Category Already exists", 400));
  }

  req.body.slug = generateUniqueSlug(categories, title);
  next();
});
