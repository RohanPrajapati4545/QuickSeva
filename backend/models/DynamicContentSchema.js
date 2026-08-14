const mongoose = require("mongoose");

/**
 * DynamicContent
 * ----------------
 * Ek hi collection me har page ka content store hota hai.
 * `page` field unique hai (e.g. "home", "about", "contact", "header").
 * `content` field Mixed type hai -> isme kuch bhi (object/array/string)
 * store ho sakta hai, isliye admin bina naya field/migration banaye
 * kisi bhi section me naya key add/update/delete kar sakta hai.
 *
 * Example document for page = "home":
 * {
 *   page: "home",
 *   content: {
 *     hero: { badge: "...", titleLine1: "...", titleLine2Highlight: "...", subtitle: "..." },
 *     whyUs: [ { icon: "fa-shield-halved", title: "...", desc: "..." }, ... ],
 *     howItWorks: [ { n: "01", icon: "...", title: "...", desc: "..." }, ... ],
 *     reviews: [ { name: "...", role: "...", quote: "..." }, ... ],
 *     appSection: { badge: "...", title: "...", desc: "..." }
 *   }
 * }
 */
const DynamicContentSchema = new mongoose.Schema(
  {
    page: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      enum: ["home", "about", "contact", "header"],
    },
    content: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin", // apke admin model ka naam yahan match kar lena
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("DynamicContent", DynamicContentSchema);