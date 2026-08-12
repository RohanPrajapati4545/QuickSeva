const express = require("express");
const router = express.Router();

const authMiddleware = require("./../middlewares/AuthMiddleware");
const vendorMiddleware = require("./../middlewares/vendorMiddleware");
const upload = require("./../middlewares/upload");
const VendorServiceController = require("./../controllers/vendorServiceController");

router.post(
  "/add-service",
  authMiddleware,
  vendorMiddleware,
  upload.single("image"),
  VendorServiceController.addService
);

router.get(
  "/all-services",
  authMiddleware,
  vendorMiddleware,
  VendorServiceController.getAllServices
);

router.get(
  "/service/:id",
  authMiddleware,
  vendorMiddleware,
  VendorServiceController.getServiceById
);

router.put(
  "/update-service/:id",
  authMiddleware,
  vendorMiddleware,
  upload.single("image"),
  VendorServiceController.updateService
);

router.delete(
  "/delete-service/:id",
  authMiddleware,
  vendorMiddleware,
  VendorServiceController.deleteService
);

router.put(
  "/update-service-status/:id",
  authMiddleware,
  vendorMiddleware,
  VendorServiceController.updateServiceStatus
);

module.exports = router;