const express = require("express");
const router = express.Router();

const UserProfileController = require("../controllers/userProfileController");
 const upload=require("./../middlewares/upload")
const authMiddleware = require("./../middlewares/AuthMiddleware");
router.get("/profile", authMiddleware, UserProfileController.getProfile);
router.put("/update-profile", authMiddleware,  upload.single("image"),UserProfileController.updateProfile);
router.put("/change-password", authMiddleware, UserProfileController.changePassword);

module.exports = router;