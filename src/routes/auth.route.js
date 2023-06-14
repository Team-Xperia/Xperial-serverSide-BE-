//Every route relating or concerning user authentication, the routes goes in here
const { Router } = require("express");

const router = Router();

const authController = require("../controllers/auth.controller");
const userValidationMiddleware = require("../middlewares/userValidation.middleware");

router.post("/user/signup", userValidationMiddleware, authController.signup);
router.post("/user/forgotPassword", authController.forgotPassword);
router.patch("user/resetPassword/:token", authController.resetPassword); //patch is used when we're manipulating the user document
router.patch("user/updateMyPassword", authController.updatePassword);
router.post("/user/login", authController.login);
router.get("/user/logout", authController.logout);

module.exports = router;
