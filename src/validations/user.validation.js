// const { default: isEmail } = require("validator/lib/isEmail");
// const { object, string } = require("zod");

// // Define the Zod validation schema
// const UserValidationSchema = object({
//   fullName: string({
//     required_error: "Full name is required",
//   })
//     .regex(/^\s*\S+(?:\s+\S+)*\s*$/)
//     .min(3, "Your full name name must not be below 3 characters!"),
//   email: string({
//     required_error: "Email is required....",
//   }).email("Invalid email address.")._type(isEmail),
//   password: string({
//     required_error: "Password is required.",
//   }).min(8, "Password must be at least 8 characters long."),
//   confirmPassword: string({
//     required_error: "Confirm password is required.",
//   }).min(8, "Password must be at least 8 characters long."),
//   // role: enum(["patient", "doctor", "admin"]).optional(),
// });

// module.exports = UserValidationSchema;

const { object, string } = require("zod");
const { isEmail } = require("validator");

// Define the Zod validation schema
const UserValidationSchema = object({
  fullName: string({
    required_error: "Full name is required",
  })
    .regex(/^\s*\S+(?:\s+\S+)*\s*$/)
    .min(3, "Your full name must not be below 3 characters!"),
  email: string({
    required_error: "Email is required",
    invalid_error: "Invalid email address",
  }).refine((value) => isEmail(value), {
    message: "Invalid email address. Must be a valid email address e.g email@example.com",
  }),
  password: string({
    required_error: "Password is required",
  }).min(8, "Password must be at least 8 characters long"),
  confirmPassword: string({
    required_error: "Confirm password is required",
  }).min(8, "Confirm password must be at least 8 characters long"),
});

module.exports = UserValidationSchema;
