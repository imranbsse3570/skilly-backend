const express = require("express");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");
const cors = require("cors");

const courseRouter = require("./router/courseRouter");
const userRouter = require("./router/userRouter");
const globalErrorHandler = require("./controller/errorController");
const filesRouter = require("./router/filesRouter");

const codeController = require("./controller/codeExecuteController");

const AppError = require("./util/appError");

const app = express();

app.use(helmet());

app.use(cors());

if (process.env.NODE_ENV === "DEVELOPMENT") app.use(morgan("dev"));

const limiter = rateLimit({
  max: 500,
  windowMs: 60 * 60 * 1000,
  message: "Too many requests from this IP, please try again in an hour!",
});
app.use("/api", limiter);

app.use(express.json({ limit: "10kb" }));

app.use(mongoSanitize());

app.use(xss());

app.use(
  hpp({
    whitelist: ["duration", "price"],
  })
);

app.use("/files", filesRouter);
app.use("/api/v1/executeCode", codeController.executingCode);

app.use("/api/v1/courses", courseRouter);
app.use("/api/v1/users", userRouter);

app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
