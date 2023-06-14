//Dependencies/Packages/Middleware
require("dotenv").config();
const cors = require("cors");
const morgan = require("morgan");
const xss = require("xss-clean");
const express = require("express");
const mongoSanitize = require("express-mongo-sanitize");

const authRoutes = require("./routes/auth.route");
const AppErrorHandler = require("./utils/app.errorHandler.util");
const globalErrorHandler = require("./middlewares/globalError.middleware");

const app = express();

//Global Middleware
app.use(cors()); // allow cross-origin request

app.use(express.json()); // Use JSON parser middleware
//middleware for updating data.
app.use(
  express.urlencoded({
    extended: true,
    limit: "10kb",
  })
);

app.use(mongoSanitize()); //Data sanitization against NoSQL query injection
//Data sanitization against XSS
app.use(xss()); //this cleans any user input from malicious HTML code.
app.set('view engine', 'pug');
//Development login
if (process.env.NODE_ENV === "development") {
  console.log(process.env.NODE_ENV);
  // console.log(process.env);
  app.use(morgan("dev"));
}

//routers
app.get("/", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Thus this route takes you to nowhere!",
  });
});
app.use("/api/v1", authRoutes);

//Text middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.headers);
  console.log(req.requestTime);
  next();
});

//Wrong route error handler middleware
app.all("**", (err, req, res, next) => {
  next(
    new AppErrorHandler(`Can't find ${req.originalUrl} on this Server!`, 404)
  );
  console.log(err.stack);
});

app.use(globalErrorHandler);

module.exports = app;
