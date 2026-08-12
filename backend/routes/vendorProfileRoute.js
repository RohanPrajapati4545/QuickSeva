const express = require("express");
const router = express.Router();

const authMiddleware = require("./../middlewares/AuthMiddleware");
const vendorMiddleware = require("./../middlewares/vendorMiddleware");
const upload  = require("./../middlewares/upload");
const VendorProfileController = require("./../controllers/vendorProfileController");

router.get(
  "/profile",
  authMiddleware,
  vendorMiddleware,
  VendorProfileController.getProfile
);

router.put(
  "/update-profile",
  authMiddleware,
  vendorMiddleware,
  upload.single("image"),
  VendorProfileController.updateProfile
);

router.put(
  "/change-password",
  authMiddleware,
  vendorMiddleware,
  VendorProfileController.changePassword
);

module.exports = router;