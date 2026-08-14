const mongoose = require("mongoose");

const HeaderContentSchema = new mongoose.Schema(
  {
    logoText: { type: String, default: "QuickSeva" },
    logoImage: { type: String, default: "" }, // stored path, e.g. "uploads/xxxxx.png" — served via /uploads static route
  },
  { timestamps: true }
);

module.exports = mongoose.model("HeaderContent", HeaderContentSchema);