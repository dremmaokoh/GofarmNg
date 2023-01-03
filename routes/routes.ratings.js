const router = require("express").Router();
const { isAuth, validateVerified  } = require("../middleware/isAuth");
const {
    createRatings
  } = require("../controller/controller.ratings");
  router.post("/ratings/:productId",validateVerified, isAuth, createRatings);
 
  module.exports = router;