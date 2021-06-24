const multer = require("multer");

const { cloudinaryUploader } = require("./../util/cloudinaryUploader");
const catchAsync = require("./../util/catchAsync");
const Category = require("./../model/courseCategoryModel");
const generateUniqueSlug = require("./../util/generateUniqueSlug");
const AppError = require("./../util/appError");
const APIFeatures = require("./../util/apiFeatures");

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

exports.getAllCategories = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(Category.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const docs = await features.query.populate("courses");

  res.status(200).json({
    status: "Success",
    results: docs.length,
    data: { docs },
  });
});

exports.getOneCategory = catchAsync(async (req, res, next) => {
  const doc = await Category.findById(req.params.id).populate("courses");

  if (!doc) {
    return next(new AppError("doc not found", 404));
  }

  res.status(200).json({
    status: "Success",
    data: { doc },
  });
});

exports.getOneByCategoryBySlug = catchAsync(async (req, res, next) => {
  const doc = await Category.findOne({ slug: req.params.slug }).populate(
    "courses"
  );

  if (!doc) {
    return next(new AppError("doc not found", 404));
  }

  res.status(200).json({
    status: "Success",
    data: { doc },
  });
});
