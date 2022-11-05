const router = require("express").Router();
const { signUp, loginUser, verifyEmail, forgotPassword , resetPassword , resetPasswordpage, logOut } = require("../controller/controller.user");
const { isAuth, validateUser , validateUserPassword} = require("../middleware/isAuth");

router.post("/register", signUp);
router.post("/login",validateUser,  loginUser);
router.get("/verify-email", verifyEmail);
router.post("/forgotpassword", validateUserPassword,  forgotPassword )
router.get("/reset-password/:id/:token",  resetPasswordpage)
router.post("/reset-password/:id/:token",  resetPassword )
router.get("/logout", isAuth, logOut)

module.exports = router;