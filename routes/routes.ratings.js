const router = require("express").Router();
const { isAuth } = require("../middleware/isAuth");
const {
    createRatings
  } = require("../controller/controller.ratings");
  router.post("/ratings/:productId", isAuth, createRatings);
 
  module.exports = router;