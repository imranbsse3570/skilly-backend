const express = require("express");
const morgan = require("morgan");

const courseRouter = require("./router/courseRouter");
const reviewRouter = require("./router/reviewRouter");
const userRouter = require("./router/userRouter");
const globalErrorHandler = require("./controller/errorController");

const app = express();

app.use(express.json());
if (process.env.NODE_ENV === "DEVELOPMENT") app.use(morgan("dev"));

app.use("/api/v1/courses", courseRouter);
app.use("/api/v1/reviews", reviewRouter);
app.use("/api/v1/users", userRouter);

app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
