const path = require("path");
const sharp = require("sharp");

const catchAsync = require("../util/catchAsync");
const AppError = require("../util/appError");

exports.resizeImages = catchAsync(async (req, res, next) => {
  const { imageType, imageName } = req.params;
  const height = req.params.height
    ? parseInt(req.params.height)
    : req.params.width
    ? parseInt(req.params.width)
    : 1000;

  const width = req.params.width ? parseInt(req.params.width) : height;

  if (!imageName || !imageType) {
    return next(new AppError("Image Source must be provided", 400));
  }

  sharp(path.resolve(`./uploads/${imageType}/${imageName}.png`))
    .resize(width, height)
    .pipe(res);
});
