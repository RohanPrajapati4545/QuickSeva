const express = require("express");
const router = express.Router();

const authMiddleware = require("./../middlewares/authMiddleware");
const vendorMiddleware = require("./../middlewares/vendorMiddleware");
const VendorCategoryController = require("./../controllers/VendorCategoryController");

router.get(
  "/all-categories",
  authMiddleware,
  vendorMiddleware,
  VendorCategoryController.getAllCategories
);

module.exports = router;