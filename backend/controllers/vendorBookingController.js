const Booking = require("../models/BookingSchema");
const VendorService = require("../models/VendorServiceSchema");

const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// ================= GET ALL BOOKINGS FOR LOGGED-IN VENDOR =================
const getAllBookings = async (req, res) => {
  try {
    const vendorId = req.user?._id || req.user?.id;
    if (!vendorId) {
      return res.status(401).json({ msg: "Unauthorized" });
    }

    const { q } = req.query;
    const filter = { vendor: vendorId };

    if (q && q.trim()) {
      const regex = { $regex: escapeRegex(q.trim()), $options: "i" };

      // customer_name lives directly on the Booking doc, but service_name
      // lives on VendorService, so we first resolve which of this vendor's
      // services match the search term and OR that in by service id.
      const matchingServiceIds = await VendorService.find({
        vendor: vendorId,
        service_name: regex,
      }).distinct("_id");

      filter.$or = [{ customer_name: regex }, { service: { $in: matchingServiceIds } }];
    }

    const bookings = await Booking.find(filter)
      .populate("service", "service_name price image")
      .sort({ createdAt: -1 });

    res.status(200).json({ bookings });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Internal server error" });
  }
};

// ================= UPDATE BOOKING STATUS (vendor only, own bookings) =================
const updateBookingStatus = async (req, res) => {
  try {
    const vendorId = req.user?._id || req.user?.id;
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = ["pending", "confirmed", "completed", "cancelled"];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ msg: "Invalid status value" });
    }

    const booking = await Booking.findOne({ _id: id, vendor: vendorId });
    if (!booking) {
      return res.status(404).json({ msg: "Booking not found" });
    }

    booking.status = status;
    await booking.save();

    res.status(200).json({ msg: "Booking status updated", booking });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Internal server error" });
  }
};

// ================= DELETE BOOKING (vendor only, own bookings) =================
const deleteBooking = async (req, res) => {
  try {
    const vendorId = req.user?._id || req.user?.id;
    const { id } = req.params;

    const booking = await Booking.findOneAndDelete({ _id: id, vendor: vendorId });
    if (!booking) {
      return res.status(404).json({ msg: "Booking not found" });
    }

    res.status(200).json({ msg: "Booking deleted" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Internal server error" });
  }
};

module.exports = {
  getAllBookings,
  updateBookingStatus,
  deleteBooking,
};