const router = require("express").Router();
const upload = require("../utils/multer");
const {
  addProduct,
  findProducts,
  similarField,
  updateProduct,
  deleteProduct,
} = require("../controller/controller.product");
const { isAuth, validateRole } = require("../middleware/isAuth");

router.post(
  "/newProduct",
  isAuth,
  validateRole,
  upload.single("productPicture"),
  addProduct
);
router.get("/findall", isAuth, findProducts);
router.get("/find/:category", isAuth, similarField);
router.put("/update/:id", isAuth, validateRole, updateProduct);
router.put("/delete/:id", isAuth, validateRole, deleteProduct);

module.exports = router;
