const jwt = require("jsonwebtoken");
const { promisify } = require("util");
const { User } = require("../models/user.model");
const AppError = require("../utils/app.errorHandler.util");
const catchAsync = require("../utils/catchAsync.util");

exports.protect = catchAsync(async (req, res, next) => {
  // Get token from the request headers
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  // Check if the token exists
  if (!token) {
    return next(
      new AppError(
        "You are not logged in. Please provide your token to gain access.",
        401
      )
    );
  }

  // Verify the token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // Check if the token is valid
  if (!decoded) {
    return next(new AppError("You are not logged in. Please login.", 401));
  }

  // Get the user ID from the decoded token
  const userId = decoded.id;
  console.log(userId);

  // Check if the user still exists in the database
  const currentUser = await User.findById(userId);
  if (!currentUser) {
    return next(
      new AppError("The user belonging to this token no longer exists.", 401)
    );
  }

  // Check if the user changed the password after the token was issued
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError(
        "User recently changed the password. Please log in again.",
        401
      )
    );
  }

  // Grant access to the protected route
  req.user = currentUser;
  res.locals.user = currentUser;
  next();
});
