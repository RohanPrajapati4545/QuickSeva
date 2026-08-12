const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
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
    // agar customer login hoke book kar raha hai to uska id (optional, auth na ho to bhi chalega)
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    customer_name: { type: String, required: true },
    customer_phone: { type: String, required: true },
    address: { type: String, required: true },
    booking_date: { type: Date, required: true },
    booking_time: { type: String },
    notes: { type: String },
    status: {
      type: String,
      enum: ["pending", "confirmed", "completed", "cancelled"],
      default: "pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Booking || mongoose.model("Booking", bookingSchema);