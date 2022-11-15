const router = require("express").Router();
const {
  signUp,
  loginUser,
  verifyEmail,
  forgotPassword,
  resetPassword,
  resetPasswordpage,
  switchfarmer,
  logOut,
} = require("../controller/controller.user");
const {
  isAuth,
  validateVerified,
  validateUserPassword
} = require("../middleware/isAuth");

router.post("/register", signUp);
router.post("/login", validateVerified, loginUser);
router.get("/verify-email", verifyEmail);
router.post("/forgotpassword", validateUserPassword, forgotPassword);
router.get("/reset-password/:id/:token", validateUserPassword, resetPasswordpage);
router.post("/reset-password/:id/:token",validateUserPassword, resetPassword);
router.post("/switch-farmer", validateVerified, isAuth, switchfarmer);
router.get("/logout", isAuth, logOut);

module.exports = router;
