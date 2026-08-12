const express = require("express");
const router = express.Router();

const authMiddleware = require("./../middlewares/AuthMiddleware");
const vendorMiddleware = require("./../middlewares/vendorMiddleware");
const VendorCategoryController = require("./../controllers/vendorCategoryController");

router.get(
  "/all-categories",
  authMiddleware,
  vendorMiddleware,
  VendorCategoryController.getAllCategories
);

module.exports = router;