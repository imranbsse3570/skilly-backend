const express = require("express");
const morgan = require("morgan");

const courseRouter = require("./router/courseRouter");
const reviewRouter = require("./router/reviewRouter");
const userRouter = require("./router/userRouter");

const app = express();

app.use(express.json());
if (process.env.NODE_ENV === "DEVELOPMENT") app.use(morgan("dev"));

app.use("/api/v1/courses", courseRouter);
app.use("/api/v1/reviews", reviewRouter);
app.use("/api/v1/users", userRouter);

module.exports = app;
