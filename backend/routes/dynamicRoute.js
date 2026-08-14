const express = require("express");
const router = express.Router();

const {
  getContent,
  getAllContent,
  updateContent,
  resetContent,
} = require("../controllers/DynamicController");
const authMiddleware = require("./../middlewares/AuthMiddleware");
const adminMiddleware = require("./../middlewares/AdminMiddleware");

// NOTE: apke project me jo bhi auth middleware pehle se bane hue hain
// (jaise userAuth / adminAuth), unka sahi path yahan daal dena.
// Neeche generic naam use kiya hai: `protect` (login check) aur `isAdmin` (role check).


// ---------- PUBLIC ROUTES (frontend Home/About/Contact/Header inhe call karenge) ----------
router.get("/:page", getContent); // GET /api/dynamic/home | /about | /contact | /header

// ---------- ADMIN ONLY ROUTES ----------
router.get("/", authMiddleware, adminMiddleware, getAllContent); // GET /api/dynamic  -> sab pages ek saath
router.put("/:page", authMiddleware, adminMiddleware, updateContent); // PUT /api/dynamic/home  { content: {...} }
router.delete("/:page", authMiddleware, adminMiddleware, resetContent); // DELETE /api/dynamic/home -> defaults par reset

module.exports = router;