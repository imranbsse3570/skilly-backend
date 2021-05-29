const AppError = require("../util/appError");
const catchAsync = require("../util/catchAsync");
const executeCode = require("../util/executeCode");

exports.executingCode = catchAsync(async (req, res, next) => {
  const { language, script } = req.body;

  if (!language || !script) {
    return next(
      new AppError(
        "Langauage and script must be provided in order to execute",
        400
      )
    );
  }

  const data = await executeCode(language, script);

  res.status(200).json({
    status: "success",
    data: {
      data,
    },
  });
});
