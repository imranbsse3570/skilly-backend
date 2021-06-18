const streamifier = require("streamifier");

const catchAsync = require("./../util/catchAsync");
const AppError = require("./../util/appError");
const { cloudinaryGet } = require("./../util/cloudinaryUploader");

exports.resizeImages = catchAsync(async (req, res, next) => {
  const { imageName, imageType } = req.params;

  if (!imageName || !imageType) {
    return next(new AppError("Image Source must be provided", 400));
  }

  const buffer = await cloudinaryGet(
    `uploads/${imageType}/${imageName}`,
    req.query
  );

  streamifier.createReadStream(buffer).pipe(res);
});
