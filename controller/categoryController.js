const multer = require("multer");

const { cloudinaryUploader } = require("./../util/cloudinaryUploader");
const catchAsync = require("./../util/catchAsync");
const Category = require("./../model/courseCategoryModel");
const generateUniqueSlug = require("./../util/generateUniqueSlug");
const AppError = require("./../util/appError");

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new AppError("File type not supported please upload an image", 400));
  }
};

exports.uploadCategoryPreviewImage = multer({
  storage,
  fileFilter,
});

exports.reFormatPicture = catchAsync(async (req, res, next) => {
  if (req.file) {
    req.body.previewImage = `category-preview-${req.body.slug}-${Date.now()}`;

    await cloudinaryUploader(
      `uploads/categories/${req.body.previewImage}`,
      req.file.buffer,
      "png"
    );
  }
  next();
});

exports.createSlug = catchAsync(async (req, res, next) => {
  const { title } = req.body;
  const categories = await Category.find({ title });

  if (categories.length > 0) {
    return next(new AppError("Category Already exists", 400));
  }

  req.body.slug = generateUniqueSlug(categories, title);
  next();
});
