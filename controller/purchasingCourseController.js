const catchAsync = require("../util/catchAsync");

exports.addCourseInUserPurchaseList = catchAsync(async (req, res, next) => {
  console.log(req.body);
});
