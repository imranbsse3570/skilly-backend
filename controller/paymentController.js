const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const path = require("path");

const Course = require(path.resolve("model/courseModel"));
const catchAsync = require(path.resolve("util/catchAsync"));
const AppError = require(path.resolve("util/appError"));
const checkingForMatchingCourse = require(path.resolve(
  "util/findingCourseInUser"
));

exports.checkingUserValidityForCheckout = catchAsync(async (req, res, next) => {
  const user = req.user;

  const course = await Course.findById(req.params.courseId);

  if (!course) {
    next(new AppError("Course not found with provided Id", 404));
  }

  if (user.role === "instructor" && user._id === course.author) {
    next(new AppError("User is author of this course", 403));
  }

  if (checkingForMatchingCourse(user.courses, req.params.courseId)) {
    next(new AppError("User already have this course", 403));
  }

  req.course = course;
  next();
});

exports.createCheckoutSession = catchAsync(async (req, res, next) => {
  const course = req.course;

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: course.title,
            images: ["https://picsum.photos/1600/900"],
          },
          unit_amount: course.price * 100,
        },
        quantity: 1,
      },
    ],
    customer_email: req.user.email,
    client_reference_id: req.params.courseId,
    mode: "payment",
    success_url: "http://localhost:3000/coursesId/lectures/lectureId",
    cancel_url: "http://localhost:3000/",
  });

  res.status(200).json({
    status: "success",
    session,
  });
});

// exports.handlePaymentToInstructor = catchAsync(async (req, res, next) => {
//   const { courseId } = req.params;

//   const course = await Course.findById(courseId);

//   if (!course) {
//     return next(new AppError("Course not found", 404));
//   }

//   const newAccount = await stripe.accounts.create({
//     type: "express",
//   });

//   const bankAccount = await stripe.accounts.createExternalAccount(
//     newAccount.id,
//     { external_account: "btok_9CUYdoUSROb2yg" }
//   );

//   const account = await stripe.accounts.update(newAccount.id, {
//     settings: {
//       payouts: {
//         schedule: {
//           interval: "manual",
//         },
//       },
//     },
//   });

//   console.log(account);

//   const accountLinks = await stripe.accountLinks.create({
//     account: account.id,
//     refresh_url: "https://example.com/reauth",
//     return_url: "https://example.com/return",
//     type: "account_onboarding",
//   });

//   const topup = await stripe.topups.create({
//     amount: 2000,
//     currency: "usd",
//     description: "Top-up for week of May 31",
//     statement_descriptor: "Weekly top-up",
//   });

//   const transfer = await stripe.transfers.create({
//     amount: 1000,
//     currency: "usd",
//     destination: account.id,
//   });

//   console.log(transfer);

//   console.log(accountLinks);
// });
