const express = require("express");
const router = express.Router();
const upload = require("./../middlewares/upload");
const AdminController=require("./../middlewares/AdminMiddleware")
const AuthController = require("./../controllers/AuthController");

router.post("/register", upload.single("image"), AuthController.register);
router.post("/login", AuthController.login);

module.exports = router;