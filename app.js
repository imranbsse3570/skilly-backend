const express = require("express");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");
const cors = require("cors");
const compression = require("compression");

<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
console.log(`${__dirname}/router/courseRouter`, "testing");
const courseRouter = require(`${__dirname}/router/courseRouter`);
=======
=======
>>>>>>> parent of af07fb5 (testing)
const courseRouter = require(path.resolve("router/courseRouter"));
>>>>>>> parent of af07fb5 (testing)
const userRouter = require(path.resolve("router/userRouter"));
const categoryRouter = require(path.resolve("router/categoryRouter"));
const globalErrorHandler = require(path.resolve("controller/errorController"));
=======
const courseRouter = require("./router/courseRouter");
const userRouter = require("./router/userRouter");
const categoryRouter = require("./router/categoryRouter");
const globalErrorHandler = require("./controller/errorController");
>>>>>>> parent of 0304b8c (testing)
const filesRouter = require("./router/filesRouter");

const codeController = require(path.resolve(
  "controller/codeExecuteController"
));

const AppError = require(path.resolve("util/appError"));

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

app.use(express.json({ limit: "50kb" }));

app.use(mongoSanitize());

app.use(xss());

app.use(
  hpp({
    whitelist: ["duration", "price"],
  })
);

app.use(compression());

app.get("/", (req, res) => {
  res.setHeader("Content-Type", "text/html");
  res.status(200).end("<h1>Hello World</h1>");
});

app.use("/files", filesRouter);
app.use("/api/v1/executeCode", codeController.executingCode);

app.use("/api/v1/courses", courseRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/categories", categoryRouter);

app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
