const VendorCategory = require("../models/vendorCategorySchema");
const VendorService = require("../models/vendorServiceSchema");
const User = require("../models/userSchema");
const Booking = require("../models/bookingSchema");
const Review = require("../models/reviewSchema");

const slugify = (str) =>
  (str || "").trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

const getApprovedVendorIds = async () => {
  const vendors = await User.find({
    role: "vendor",
    approvalStatus: "approved",
    isBlocked: { $ne: true },
  }).select("_id");
  return vendors.map((v) => v._id);
};

const isVendorLive = (vendor) =>
  Boolean(vendor) && vendor.approvalStatus === "approved" && !vendor.isBlocked;

// Recomputes avgRating + reviewCount on the VendorService doc from all
// reviews currently attached to it. Called after a review is created so the
// denormalized fields never drift out of sync.
const recomputeServiceRating = async (serviceId) => {
  const stats = await Review.aggregate([
    { $match: { service: serviceId } },
    {
      $group: {
        _id: "$service",
        avgRating: { $avg: "$rating" },
        reviewCount: { $sum: 1 },
      },
    },
  ]);

  const avgRating = stats.length ? Math.round(stats[0].avgRating * 10) / 10 : 0;
  const reviewCount = stats.length ? stats[0].reviewCount : 0;

  await VendorService.findByIdAndUpdate(serviceId, { avgRating, reviewCount });
};

const getCategories = async (req, res) => {
  try {
    // Sirf un vendors ki services count karo jo khud approved & unblocked hain
    const allowedVendorIds = await getApprovedVendorIds();

    // Un category IDs ko dhundo jinki kam se kam 1 service
    // active + approved ho, aur vendor bhi approved ho
    const categoriesWithLiveServices = await VendorService.aggregate([
      {
        $match: {
          status: true,
          approvalStatus: "approved",
          vendor: { $in: allowedVendorIds },
        },
      },
      { $group: { _id: "$category" } },
    ]);

    const validCategoryIds = categoriesWithLiveServices.map((c) => c._id);

    if (validCategoryIds.length === 0) {
      return res.status(200).json({ categories: [] });
    }

    const categories = await VendorCategory.aggregate([
      {
        $match: {
          status: true,
          _id: { $in: validCategoryIds },
        },
      },
      {
        $group: {
          _id: { $toLower: "$category_name" },
          category_name: { $first: "$category_name" },
          icon: { $first: "$icon" },
        },
      },
      { $sort: { category_name: 1 } },
    ]);

    const withSlug = categories.map((c) => ({
      category_name: c.category_name,
      icon: c.icon || "fa-tags",
      slug: slugify(c.category_name),
    }));

    res.status(200).json({ categories: withSlug });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Internal server error" });
  }
};

const getServices = async (req, res) => {
  try {
    const { category, q, location, limit } = req.query;
    const filter = { status: true, approvalStatus: "approved" };

    let allowedVendorIds = await getApprovedVendorIds();

    if (category) {
      const allCategories = await VendorCategory.find({ status: true }).select("_id category_name");
      const matchingIds = allCategories
        .filter((c) => slugify(c.category_name) === category)
        .map((c) => c._id);

      if (matchingIds.length === 0) {
        return res.status(200).json({ services: [] });
      }
      filter.category = { $in: matchingIds };
    }

    if (q) {
      filter.$or = [
        { service_name: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
      ];
    }

    if (location) {
      const vendorsAtLocation = await User.find({
        role: "vendor",
        address: { $regex: location, $options: "i" },
      }).select("_id");
      const locationIds = new Set(vendorsAtLocation.map((v) => String(v._id)));
      allowedVendorIds = allowedVendorIds.filter((id) => locationIds.has(String(id)));
    }

    filter.vendor = { $in: allowedVendorIds };

    let query = VendorService.find(filter)
      .populate("category", "category_name icon")
      .populate("vendor", "name shop_name image address")
      .sort({ createdAt: -1 });

    if (limit) query = query.limit(Number(limit));

    const services = await query;

    res.status(200).json({ services });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Internal server error" });
  }
};

const getServiceById = async (req, res) => {
  try {
    const { id } = req.params;

    const service = await VendorService.findOne({
      _id: id,
      status: true,
      approvalStatus: "approved",
    })
      .populate("category")
      .populate("vendor", "name shop_name image address contact approvalStatus isBlocked");

    if (!service || !isVendorLive(service.vendor)) {
      return res.status(404).json({ msg: "Service not found" });
    }

    const serviceObj = service.toObject();
    if (serviceObj.vendor) {
      delete serviceObj.vendor.approvalStatus;
      delete serviceObj.vendor.isBlocked;
    }
    // serviceObj.avgRating / serviceObj.reviewCount already come along from
    // the schema fields — nothing extra to do here.

    res.status(200).json({ service: serviceObj });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Internal server error" });
  }
};

const getVendorDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const vendor = await User.findOne({
      _id: id,
      role: "vendor",
      approvalStatus: "approved",
      isBlocked: { $ne: true },
    }).select("name shop_name image address contact createdAt");

    if (!vendor) {
      return res.status(404).json({ msg: "Vendor not found" });
    }

    const services = await VendorService.find({
      vendor: id,
      status: true,
      approvalStatus: "approved",
    })
      .populate("category", "category_name icon")
      .sort({ createdAt: -1 });

    res.status(200).json({ vendor, services });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Internal server error" });
  }
};

// Home page ke "Featured vendors" section ke liye — koi bhi approved aur
// active vendor is list me aayega, chahe uski abhi tak koi service admin se
// approved na hui ho. Jinke paas jyada approved services hai unhe upar
// dikhaya jaata hai, baaki naye vendors ko sabse pehle (createdAt desc).
const getFeaturedVendors = async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 4;

    const approvedVendors = await User.find({
      role: "vendor",
      approvalStatus: "approved",
      isBlocked: { $ne: true },
    })
      .select("name shop_name image createdAt")
      .sort({ createdAt: -1 });

    if (approvedVendors.length === 0) {
      return res.status(200).json({ vendors: [] });
    }

    const approvedVendorIds = approvedVendors.map((v) => v._id);

    const grouped = await VendorService.aggregate([
      {
        $match: {
          status: true,
          approvalStatus: "approved",
          vendor: { $in: approvedVendorIds },
        },
      },
      { $group: { _id: "$vendor", serviceCount: { $sum: 1 } } },
    ]);

    const countMap = new Map(grouped.map((g) => [String(g._id), g.serviceCount]));

    const withCounts = approvedVendors.map((v) => ({
      ...v.toObject(),
      serviceCount: countMap.get(String(v._id)) || 0,
    }));

    withCounts.sort((a, b) => {
      if (b.serviceCount !== a.serviceCount) return b.serviceCount - a.serviceCount;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    res.status(200).json({ vendors: withCounts.slice(0, limit) });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Internal server error" });
  }
};

const bookService = async (req, res) => {
  try {
    const { id } = req.params;
    const { customer_name, customer_phone, address, booking_date, booking_time, notes } = req.body;

    if (!customer_name || !customer_phone || !address || !booking_date) {
      return res.status(400).json({ msg: "Please fill all required fields" });
    }

    const service = await VendorService.findOne({
      _id: id,
      status: true,
      approvalStatus: "approved",
    }).populate("vendor", "approvalStatus isBlocked");

    if (!service || !isVendorLive(service.vendor)) {
      return res.status(404).json({ msg: "Service not found" });
    }

    const booking = await Booking.create({
      service: service._id,
      vendor: service.vendor._id,
      user: req.user?._id || req.user?.id || undefined,
      customer_name,
      customer_phone,
      address,
      booking_date,
      booking_time,
      notes,
    });

    res.status(201).json({ msg: "Booking request sent successfully", booking });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Internal server error" });
  }
};

const getMyBookings = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    if (!userId) {
      return res.status(401).json({ msg: "Unauthorized" });
    }

    const bookings = await Booking.find({ user: userId })
      .populate("service", "service_name price image")
      .populate("vendor", "name shop_name contact address")
      .sort({ createdAt: -1 });

    // Completed bookings ke liye batao ki review already diya ja chuka hai
    // ya nahi, taaki frontend "Add Review" vs "Reviewed" state dikha sake.
    const completedIds = bookings
      .filter((b) => b.status === "completed")
      .map((b) => b._id);

    let reviewedBookingIds = new Set();
    if (completedIds.length > 0) {
      const reviews = await Review.find({ booking: { $in: completedIds } }).select("booking");
      reviewedBookingIds = new Set(reviews.map((r) => String(r.booking)));
    }

    const bookingsWithReviewFlag = bookings.map((b) => ({
      ...b.toObject(),
      hasReview: reviewedBookingIds.has(String(b._id)),
    }));

    res.status(200).json({ bookings: bookingsWithReviewFlag });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Internal server error" });
  }
};

const cancelMyBooking = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    const { id } = req.params;

    const booking = await Booking.findOne({ _id: id, user: userId });
    if (!booking) {
      return res.status(404).json({ msg: "Booking not found" });
    }

    if (["completed", "cancelled"].includes(booking.status)) {
      return res.status(400).json({ msg: `Booking already ${booking.status}` });
    }

    booking.status = "cancelled";
    await booking.save();

    res.status(200).json({ msg: "Booking cancelled", booking });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Internal server error" });
  }
};

 
const addReview = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    if (!userId) {
      return res.status(401).json({ msg: "Unauthorized" });
    }

    const { bookingId } = req.params;
    const { rating, comment } = req.body;

    const ratingNum = Number(rating);
    if (!ratingNum || ratingNum < 1 || ratingNum > 5) {
      return res.status(400).json({ msg: "Rating must be between 1 and 5" });
    }

    const booking = await Booking.findOne({ _id: bookingId, user: userId });
    if (!booking) {
      return res.status(404).json({ msg: "Booking not found" });
    }

    if (booking.status !== "completed") {
      return res.status(400).json({ msg: "You can only review a completed booking" });
    }

    const existing = await Review.findOne({ booking: booking._id });
    if (existing) {
      return res.status(400).json({ msg: "You have already reviewed this booking" });
    }

    const review = await Review.create({
      booking: booking._id,
      service: booking.service,
      vendor: booking.vendor,
      user: userId,
      rating: ratingNum,
      comment: (comment || "").trim(),
    });

    await recomputeServiceRating(booking.service);

    res.status(201).json({ msg: "Review submitted successfully", review });
  } catch (error) {
    // duplicate key error agar koi race condition me dobara submit kare
    if (error?.code === 11000) {
      return res.status(400).json({ msg: "You have already reviewed this booking" });
    }
    console.log(error);
    res.status(500).json({ msg: "Internal server error" });
  }
};

const getServiceReviews = async (req, res) => {
  try {
    const { id } = req.params;
    const limit = Number(req.query.limit) || 20;

    const reviews = await Review.find({ service: id })
      .populate("user", "name image")
      .sort({ createdAt: -1 })
      .limit(limit);

    res.status(200).json({ reviews });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Internal server error" });
  }
};

module.exports = {
  getCategories,
  getServices,
  getServiceById,
  getVendorDetails,
  getFeaturedVendors,
  bookService,
  getMyBookings,
  cancelMyBooking,
  addReview,
  getServiceReviews,
};