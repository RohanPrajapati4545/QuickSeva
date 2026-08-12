const express = require("express");
const router = express.Router();

const VendorBookingController = require("../controllers/VendorBookingController");
// NOTE: match this import to whatever middleware your vendor-service route
// already uses to verify the vendor's token / attach req.user
const AuthMiddleware=require("./../middlewares/AuthMiddleware")

router.get("/all-bookings", AuthMiddleware, VendorBookingController.getAllBookings);
router.put("/update-status/:id", AuthMiddleware, VendorBookingController.updateBookingStatus);
router.delete("/delete-booking/:id", AuthMiddleware, VendorBookingController.deleteBooking);

module.exports = router;