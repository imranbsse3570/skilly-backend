const catchAsync = require("../util/catchAsync");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

exports.addCourseInUserPurchaseList = catchAsync(async (req, res, next) => {
  const signature = req.headers["stripe-signature"];

  const event = stripe.webhooks.constructEvents(
    req.body,
    signature,
    process.env.process.env.STRIPE_WEBHOOK_SECRET
  );

  if (event.type === "checkout.session.completed") {
    console.log(event.data.object);
  }
});
