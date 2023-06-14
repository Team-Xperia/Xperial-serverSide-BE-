const userValidation = require("../validations/user.validation");
const AppError = require("../utils/app.errorHandler.util");

const userValidationMiddleware = (req, res, next) => {
  const { error } = userValidation.safeParse(req.body);

  if (error) {
    const errorMessage = error.message.replace(/"/g, ""); // Remove double quotes from error message
    console.log(errorMessage);

    if (process.env.NODE_ENV === "production") {
      const firstErrorMessage = error.errors.length > 0 ? error.errors[0].message : "Invalid input data.";
      return next(new AppError(firstErrorMessage, 400));
    }
    
    // Extract the first error message
    const firstError = error.errors.length > 0 ? error.errors[0] : null;
    const firstErrorMessage = firstError ? `${firstError.path[0]} ${firstError.message}` : "Invalid input data.";

    return res.status(400).json({
      status: "FAIL!!!!!",
      message: firstErrorMessage,
    });
  }

  next();
};

module.exports = userValidationMiddleware;
