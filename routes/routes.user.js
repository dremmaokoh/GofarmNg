const router = require("express").Router();
const { signUp, loginUser, verifyEmail, forgotPassword , resetPassword , resetPasswordpage } = require("../controller/controller.user");
const { isAuth, validateUser , validateUserPassword} = require("../middleware/isAuth");

router.post("/register", signUp);
router.post("/login",validateUser,  loginUser);
router.get("/verify-email", verifyEmail);
router.post("/forgotpassword", validateUserPassword,  forgotPassword )
router.get("/reset-password/:id/:token",  resetPasswordpage)
router.post("/reset-password/:id/:token",  resetPassword )
// router.get("/logout",  isAuth, function(req, res, next) {
//     req.logout(function(err) {
//       if (err) { return next(err); }
//       res.redirect("/");
//     });
//   });
// router.get("/pets", isAuth, findPets);
// router.put("/order/:id", isAuth, orderPet);
module.exports = router;