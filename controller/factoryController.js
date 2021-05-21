const catchAsync = require("../util/catchAsync");
const AppError = require("../util/appError");
const APIFeatures = require("../util/apiFeatures");

exports.create = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);

    res.status(200).json({
      status: "success",
      data: {
        doc,
      },
    });
  });

exports.getAll = (Model) =>
  catchAsync(async (req, res, next) => {
    const features = new APIFeatures(Model.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const docs = await features.query;

    res.status(200).json({
      status: "Success",
      results: docs.length,
      data: { docs },
    });
  });

exports.getOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findById(req.params.id);
    if (!doc) {
      return next(new AppError("doc not found", 404));
    }

    res.status(200).json({
      status: "Success",
      data: { doc },
    });
  });

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) {
      return next(new AppError("doc not Found", 404));
    }

    res.status(204).json({
      status: "Success",
    });
  });

exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = req.document;
    Object.keys(req.body).forEach((value) => {
      doc[value] = req.body[value];
    });

    await doc.save();

    res.status(202).json({
      status: "success",
      data: {
        doc,
      },
    });
  });

exports.validateUser = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findById(req.params.id);
    if (!doc) return next(new AppError("Doc not Found", 404));

    if (req.user._id.toString() !== doc.author.toString()) {
      if (req.user.role !== "admin") {
        return next(new AppError("Access Forbidden", 403));
      }
    }
    req.document = doc;
    next();
  });

exports.checkForCourse = catchAsync(async (req, res, next) => {
  const course = await Course.findById(req.params.courseId);
  if (!course) return next(new AppError("Course Not Found", 404));
  next();
});
