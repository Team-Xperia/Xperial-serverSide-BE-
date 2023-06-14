const AppError = require("../utils/app.errorHandler.util");

const handleValidationErrorDB = err => {
  const errors = Object.values(err.errors).map(el => el.message);

  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const sendDevError = (err, req, res) => {
  if (req.originalUrl.startsWith("/api")) {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  }
};

const sendProdError = (err, req, res) => {
  //A) API
  if (req.originalUrl.startsWith("/api")) {
    //1) Operational Trusted error: send message to client
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message
      });
    }
    //i) Log error
    console.error("ERROR!!!", err);
    //ii) Send generic message
    return res.status(err.statusCode).json({
      status: "error",
      message: "Something went wrong!",
    });
  }
};

const globalErrorHandler = (err, req, res, next) => {
  console.error(err.stack);

  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "development") {
    sendDevError(err, req, res);
  } else if (process.env.NODE_ENV === "production") {
    // eslint-disable-next-line node/no-unsupported-features/es-syntax
    let error = { ...err };
    error.message = err.message;
    if (error._message === 'User validation failed')
    error = handleValidationErrorDB(error);
    // if (error.name === "CastError" || error.kind === "ObjectId")
    //   error = handleCastErrorDB(error);
    sendProdError(error, req, res);
  }
};

module.exports = globalErrorHandler;
