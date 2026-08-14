const mongoose = require("mongoose");

const ContactContentSchema = new mongoose.Schema(
  {
    // ===== HERO =====
    heroBadgeText: { type: String, default: "Get in touch" },
    heroTitle: { type: String, default: "We're here to help." },
    heroSubtitle: { type: String, default: "Questions, feedback or a booking issue — reach out and we'll get back within a day." },

    // ===== CONTACT DETAILS =====
    phone: { type: String, default: "+91 98765 43210" },
    email: { type: String, default: "support@quickseva.com" },
    address: { type: String, default: "" },
    mapEmbedUrl: { type: String, default: "" },
    officeHours: { type: String, default: "Mon–Sat, 9:00 AM – 7:00 PM" },

    // ===== FORM =====
    formHeading: { type: String, default: "Send us a message" },
    formSubheading: { type: String, default: "Fill the form and our team will reach out." },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ContactContent", ContactContentSchema);