const express = require("express");
const router = express.Router();

const authMiddleware = require("./../middlewares/AuthMiddleware");
const adminMiddleware = require("./../middlewares/AdminMiddleware");

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

const { getHomeContent, updateHomeContent } = require("./../controllers/HomeCotentController"); //this is the mistake 
const { getHeaderContent, updateHeaderContent } = require("./../controllers/HeaderContentController");
const { getAboutContent, updateAboutContent } = require("./../controllers/AboutContentController");
const { getContactContent, updateContactContent } = require("./../controllers/ContactContentController");

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

// ===== HOME PAGE CONTENT =====
router.get("/home-content", authMiddleware, adminMiddleware, getHomeContent);
router.put("/home-content", authMiddleware, adminMiddleware, updateHomeContent);

// ===== HEADER CONTENT (logo / nav links / cta / top bar) =====
router.get("/header-content", authMiddleware, adminMiddleware, getHeaderContent);
router.put("/header-content", authMiddleware, adminMiddleware, updateHeaderContent);

// ===== ABOUT PAGE CONTENT (hero / story / mission / values / stats / team) =====
router.get("/about-content", authMiddleware, adminMiddleware, getAboutContent);
router.put("/about-content", authMiddleware, adminMiddleware, updateAboutContent);

// ===== CONTACT PAGE CONTENT (hero / contact details / form heading) =====
router.get("/contact-content", authMiddleware, adminMiddleware, getContactContent);
router.put("/contact-content", authMiddleware, adminMiddleware, updateContactContent);

module.exports = router;