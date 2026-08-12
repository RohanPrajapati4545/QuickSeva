const mongoose = require("mongoose");

const fieldSchema = new mongoose.Schema(
  {
    label: {
      type: String,
      required: true,
    },
    field_name: {
      type: String,
      required: true,
    },
    field_type: {
      type: String,
      enum: ["text", "number", "select", "textarea", "checkbox"],
      default: "text",
    },
    options: [
      {
        type: String,
      },
    ],
    required: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false }
);

const vendorCategorySchema = new mongoose.Schema(
  {
    category_name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    icon: {
      type: String,
      default: "fa-tags",
    },
    description: {
      type: String,
      default: "",
    },
    status: {
      type: Boolean,
      default: true,
    },
    fields: [fieldSchema],
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.VendorCategory || mongoose.model("VendorCategory", vendorCategorySchema);