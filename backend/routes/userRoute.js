const express = require("express");
const router = express.Router();

const UserController = require("./../controllers/UserController");
 
const AuthMiddleware = require("./../middlewares/AuthMiddleware");


router.get("/categories", UserController.getCategories);
router.get("/services", UserController.getServices);
router.get("/service/:id", UserController.getServiceById);
router.get("/vendor/:id", UserController.getVendorDetails);
router.get("/featured-vendors", UserController.getFeaturedVendors);
router.post("/service/:id/book",AuthMiddleware, UserController.bookService);
router.get("/my-bookings", AuthMiddleware, UserController.getMyBookings);
router.put("/cancel-booking/:id", AuthMiddleware, UserController.cancelMyBooking);


module.exports = router;