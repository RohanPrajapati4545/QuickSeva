const express = require("express");
const router = express.Router();

const authMiddleware = require("./../middlewares/AuthMiddleware");
const adminMiddleware = require("./../middlewares/AdminMiddleware");

// NOTE: adjust this import to match whatever multer instance your project
// already uses for image uploads (e.g. the one used by the user-facing
// profile update route). It must be a configured multer() instance that
// exposes `.single(fieldName)`.
const upload = require("../middlewares/upload");

const {
  getDashboardSummary,
  getAllUsers,
  getUserById,
  updateUserStatus,
  updateUser,
  deleteUser,
  getAllVendors,
  getVendorById,
  updateVendorApproval,
  updateVendorStatus,
  updateVendor,
  deleteVendor,
  addCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  updateCategoryStatus,
  deleteCategory,
  getAllServices,
  getServiceById,
  updateServiceApproval,
  deleteService,
} = require("../controllers/AdminController");

router.get("/dashboard-summary", authMiddleware, adminMiddleware, getDashboardSummary);

router.get("/users/all-users", authMiddleware, adminMiddleware, getAllUsers);
router.get("/users/user/:id", authMiddleware, adminMiddleware, getUserById);
router.put("/users/update-status/:id", authMiddleware, adminMiddleware, updateUserStatus);
router.put(
  "/users/update-user/:id",
  authMiddleware,
  adminMiddleware,
  upload.single("image"),
  updateUser
);
router.delete("/users/delete-user/:id", authMiddleware, adminMiddleware, deleteUser);

router.get("/vendors/all-vendors", authMiddleware, adminMiddleware, getAllVendors);
router.get("/vendors/vendor/:id", authMiddleware, adminMiddleware, getVendorById);
router.put("/vendors/update-approval/:id", authMiddleware, adminMiddleware, updateVendorApproval);
router.put("/vendors/update-status/:id", authMiddleware, adminMiddleware, updateVendorStatus);
router.put(
  "/vendors/update-vendor/:id",
  authMiddleware,
  adminMiddleware,
  upload.single("image"),
  updateVendor
);
router.delete("/vendors/delete-vendor/:id", authMiddleware, adminMiddleware, deleteVendor);

router.post("/categories/add-category", authMiddleware, adminMiddleware, addCategory);
router.get("/categories/all-categories", authMiddleware, adminMiddleware, getAllCategories);
router.get("/categories/category/:id", authMiddleware, adminMiddleware, getCategoryById);
router.put("/categories/update-category/:id", authMiddleware, adminMiddleware, updateCategory);
router.put("/categories/update-status/:id", authMiddleware, adminMiddleware, updateCategoryStatus);
router.delete("/categories/delete-category/:id", authMiddleware, adminMiddleware, deleteCategory);

router.get("/services/all-services", authMiddleware, adminMiddleware, getAllServices);
router.get("/services/service/:id", authMiddleware, adminMiddleware, getServiceById);
router.put("/services/update-approval/:id", authMiddleware, adminMiddleware, updateServiceApproval);
router.delete("/services/delete-service/:id", authMiddleware, adminMiddleware, deleteService);

module.exports = router;