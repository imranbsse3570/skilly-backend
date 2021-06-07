const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const Course = require("../model/courseModel");
const User = require("../model/userModel");
const catchAsync = require("../util/catchAsync");

exports.addCourseInUserPurchaseList = catchAsync(async (req, res, next) => {
  const signature = req.headers["stripe-signature"];

  const event = stripe.webhooks.constructEvent(
    req.body,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET
  );

  if (event.type === "checkout.session.completed") {
    console.log(event.data.object);

    const { client_reference_id, customer_email } = event.data.object;

    const user = await User.findOne({ email: customer_email });
    const course = await Course.findById(client_reference_id);

    user.courses = [...user.courses, { courseId: course._id }];

    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      status: "success",
      message: "Course purchased successfully",
    });
  } else {
    res.status(500).json({
      status: "fail",
      message: "Purchased Failed",
    });
  }
});
