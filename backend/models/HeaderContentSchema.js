const mongoose = require("mongoose");

// One nav link in the header menu
const navLinkSchema = new mongoose.Schema(
  {
    label: { type: String, default: "" },
    path: { type: String, default: "/" },
  },
  { _id: false }
);

const HeaderContentSchema = new mongoose.Schema(
  {
    logoText: { type: String, default: "QuickSeva" },
    logoIcon: { type: String, default: "fa-bolt" }, // font-awesome class WITHOUT "fa-solid" prefix

    navLinks: {
      type: [navLinkSchema],
      default: [
        { label: "Home", path: "/" },
        { label: "Services", path: "/services" },
        { label: "About", path: "/about" },
        { label: "Contact", path: "/contact" },
      ],
    },

    ctaText: { type: String, default: "Become a Vendor" },
    ctaLink: { type: String, default: "/register" },

    topBarText: { type: String, default: "" }, // optional announcement strip, empty = hidden
  },
  { timestamps: true }
);

module.exports = mongoose.model("HeaderContent", HeaderContentSchema);