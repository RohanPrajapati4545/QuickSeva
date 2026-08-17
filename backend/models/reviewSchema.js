const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    // ek booking se sirf EK review ban sakta hai — unique index isko enforce karta hai
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
      unique: true,
    },
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "VendorService",
      required: true,
    },
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      default: "",
      trim: true,
      maxlength: 500,
    },
  },
  { timestamps: true }
);

// service ke reviews page pe sabse recent pehle dikhane ke liye
reviewSchema.index({ service: 1, createdAt: -1 });

module.exports = mongoose.models.Review || mongoose.model("Review", reviewSchema);