const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    contact: {
      type: String,
      required: true,
    },
    image: {
      type: String,
    },
    role: {
      type: String,
      enum: ["customer", "vendor", "admin"],
      default: "customer",
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    shop_name: { type: String, default: "" },
    address: { type: String, default: "" },
    // Only meaningful for role: "vendor" — used by the admin panel to
    // approve/reject vendor signups.
    approvalStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

// Guard against "Cannot overwrite `User` model once compiled" if this file
// ever gets required through more than one resolved path.
module.exports = mongoose.models.User || mongoose.model("User", userSchema);