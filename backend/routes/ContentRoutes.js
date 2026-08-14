const express = require("express");
const router = express.Router();

const { getHomeContent } = require("../controllers/HomeContentController");
const { getHeaderContent } = require("../controllers/HeaderContentController");
const { getAboutContent } = require("../controllers/AboutContentController");
const { getContactContent } = require("../controllers/ContactContentController");

// No auth — these are consumed by public pages (Home.jsx, header, About.jsx, Contact.jsx)
router.get("/home", getHomeContent);
router.get("/header", getHeaderContent);
router.get("/about", getAboutContent);
router.get("/contact", getContactContent);

module.exports = router;