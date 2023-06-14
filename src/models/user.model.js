const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const validator = require("validator");

const { generateRandomAvatar } = require("../utils/randomAvater.util");

const UserSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      min: 3,
      required: [true, "First name is required."],
      trim: true,
    },

    email: {
      type: String,
      unique: true,
      required: [true, "Email is required."],
      validate: [
        validator.isEmail,
        "Please provide a valid email, example@gmail.com",
      ],
    },
    age: {
      type: Number,
    },
    photo: {
      type: String,
      default: "default.jpg",
    },
    password: {
      type: String,
      minlength: 8,
      required: [true, "Password is required."],
      select: false,
    },
    confirmPassword: {
      type: String,
      required: [true, "Please confirm your password."],
      validate: {
        // Check if the confirmPassword matches the password field
        validator: function (value) {
          return value === this.password;
        },
        message: "Passwords do not match!",
      },
    },
    role: {
      type: String,
      lowercase: true,
      enum: ["consumer", "vendor", "admin"],
      default: "user",
    },
    active: {
      type: Boolean,
      default: true,
      select: false,
    },
    passwordResetAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Add PreSave Hook
UserSchema.pre("save", async function (next) {
  // This only works if the password is modified
  if (!this.isModified("password")) return next();

  //Hash the password with cost/salt of 10
  this.password = await bcrypt.hash(this.password, 10);
  //Delete the confirmPassword field
  this.confirmPassword = undefined;

  // Generate Random Image
  try {
    const avatarUrl = await generateRandomAvatar(this.email);
    this.photo = avatarUrl;
  } catch (err) {
    console.error(err);
  }
  return next();
});

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password") || this.isNew) return next();

  this.passwordResetAt = (await Date.now()) - 1000;
  next();
});

UserSchema.pre(/^find/, function (next) {
  //this points to the current query
  this.find({ active: { $ne: false } });
  next();
});

// Instance Methods
UserSchema.methods.comparePassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

UserSchema.methods.changedPasswordAfter = function (JWTTimeStamp) {
  if (this.passwordResetAt) {
    console.log(this.passwordResetAt, JWTTimeStamp);
  }
  if (this.passwordResetAt) {
    const changedTimeStamp = parseInt(
      this.passwordResetAt.getTime() / 1000,
      10
    );
    console.log(changedTimeStamp, JWTTimeStamp);
    return JWTTimeStamp < changedTimeStamp;
  }

  //False means not changed
  return false;
};

UserSchema.methods.correctPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(30).toString("hex");

  this.passwordResetToken = crypto //This is the encrypted version of the token that will be stored in the DB.
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  console.log({ resetToken }, this.passwordResetToken);

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; //this is the time when the passwordResetToken stored in the DB will expire. This one is  not sent to the user

  return resetToken;
};

const User = mongoose.model("User", UserSchema);

module.exports = { User };
