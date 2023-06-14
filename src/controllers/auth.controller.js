const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const Email = require("../utils/email.util");
const { User } = require("../models/user.model");
const catchAsync = require("../utils/catchAsync.util");
const AppError = require("../utils/app.errorHandler.util");

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

const createSendToken = (user, statusCode, req, res) => {
  const token = signToken(user._id);
  const cookieExpiresInDays = 7; // Example: JWT cookie expires in 7 days
  const cookieExpiresInMilliseconds = cookieExpiresInDays * 24 * 60 * 60 * 1000;
  const cookieExpiresAt = new Date(Date.now() + cookieExpiresInMilliseconds);

  res.cookie("jwt", token, {
    expires: cookieExpiresAt,
    httpOnly: true,
    secure: req.secure || req.headers["x-forwarded-proto"] === "https",
  });

  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const { email } = req.body;
  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new AppError("User already exists, please log in.", 404));
  }

  // Create new user
  const newUser = await User.create({
    fullName: req.body.fullName,
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    role: req.body.role,
  });
  newUser.password = undefined;
  newUser.confirmPassword = undefined;

  // Return token
  createSendToken(newUser, 201, req, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1) Check if email and password exist
  if (!email || !password) {
    return next(new AppError("Please provide email and password!", 400));
  }
  // Check if user exists
  const user = await User.findOne({ email }).select("+password");
  if (!user) return next(new AppError("Invalid email or password!", 401));

  if (!user || !(await user.comparePassword(password, user.password))) {
    //This correctPassword is an "Instance Method" defined in the userModel
    return next(new AppError("Incorrect email or password", 401));
  }

  //If all is correct, return token
  createSendToken(user, 201, req, res);
});

exports.logout = (req, res) => {
  res.cookie("jwt", "loggedout", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({ status: "success" });
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;
  //Check if body request is empty
  if (!email) return next(new AppError("Please input your email!", 400));

  //Check if user exist
  const user = await User.findOne({ email });
  if (!user) return next(new AppError("This user does not exit!"));

  //Generate the random reset token
  const resetToken = user.correctPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  //Send password reset email link if user exist
  try {
    const resetURL = `${req.protocol}://${req.get(
      "host"
    )}/api/v1/user/resetPassword/${resetToken}`;

    await new Email(user, resetURL).sendPasswordReset_ForgetLink();

    res.status(200).json({
      status: "success",
      message: "Token sent to email!",
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    console.log(err);

    return next(
      new AppError(
        "There was an error sending the email. Try again later!",
        500
      )
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on the token
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  // 2) If token has not expired, and there is user, set the new password
  if (!user) {
    return next(new AppError("Token is invalid or has expired", 400));
  }
  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // 3) Update changedPasswordAt property for the user
  // 4) Log the user in, send JWT
  createSendToken(user, 200, req, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1) Get user from collection
  const user = await User.findById(req.user.id).select("+password");

  // 2) Check if POSTed current password is correct
  if (!(await user.comparePassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError("Your current password is wrong.", 401));
  }

  // 3) If so, update password
  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;
  if (user.password !== req.body.passwordConfirm) {
    return next(new AppError("Passwords do not match!", 401));
  }
  await user.save();

  // 4) Log user in, send JWT
  createSendToken(user, 200, req, res);
});

exports.restrictTo =
  (...roles) =>
  (req, res, next) => {
    // by default, role="guest"
    if (!roles.includes(req.admin)) {
      return next(
        new AppError("You do not have permission to perform this action", 403)
      );
    }
    next();
  };
