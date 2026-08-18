const User = require("../models/userSchema");
    const Booking = require("../models/bookingSchema");
    const VendorCategory = require("../models/vendorCategorySchema");
    const VendorService = require("../models/vendorServiceSchema");

    const toClientUser = (userDoc) => {
    const obj = userDoc.toObject ? userDoc.toObject() : userDoc;
    const { contact, isBlocked, password, ...rest } = obj;
    return {
        ...rest,
        phone: contact,
        status: !isBlocked,
    };
    };

    const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    const DEFAULT_PAGE_SIZE = 20;

    
    const getPagination = (query) => {
    const page = Math.max(1, parseInt(query.page, 10) || 1);
    const limit = Math.max(DEFAULT_PAGE_SIZE, parseInt(query.limit, 10) || DEFAULT_PAGE_SIZE);
    return { page, limit, skip: (page - 1) * limit };
    };

    const buildPaginationMeta = (page, limit, total) => ({
    page,
    limit,
    total,
    totalPages: Math.max(1, Math.ceil(total / limit)),
    });

    
    const getUploadedImagePath = (file) => {
    if (!file) return undefined;
    const raw = file.path || `${file.destination || "uploads"}/${file.filename}`;
    return raw.replace(/\\/g, "/").replace(/^\/+/, "");
    };

    const getDashboardSummary = async (req, res) => {
    try {
        const [totalVendors, pendingVendors, totalUsers, totalBookings, recentVendorsRaw] =
        await Promise.all([
            User.countDocuments({ role: "vendor" }),
            User.countDocuments({ role: "vendor", approvalStatus: "pending" }),
            User.countDocuments({ role: "customer" }),
            Booking.countDocuments(),
            User.find({ role: "vendor" })
            .sort({ createdAt: -1 })
            .limit(5)
            .select("shop_name name email approvalStatus createdAt"),
        ]);

        res.status(200).json({
        summary: {
            totalVendors,
            pendingVendors,
            totalUsers,
            totalBookings,
        },
        recentVendors: recentVendorsRaw,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ msg: "Internal server error" });
    }
    };

    const getAllUsers = async (req, res) => {
    try {
        const { status, q } = req.query;
        const { page, limit, skip } = getPagination(req.query);

        // baseFilter = everything except the status tab (role + search). Tab
        // counts are computed from this so they never depend on which status
        // tab is currently selected or which page you're on.
        const baseFilter = { role: "customer" };
        if (q && q.trim()) {
        const regex = { $regex: escapeRegex(q.trim()), $options: "i" };
        baseFilter.$or = [{ name: regex }, { email: regex }, { contact: regex }];
        }

        const filter = { ...baseFilter };
        if (status === "active") filter.isBlocked = false;
        if (status === "inactive") filter.isBlocked = true;

        const [users, total, activeCount, inactiveCount] = await Promise.all([
        User.find(filter)
            .select("-password")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit),
        User.countDocuments(filter),
        User.countDocuments({ ...baseFilter, isBlocked: false }),
        User.countDocuments({ ...baseFilter, isBlocked: true }),
        ]);

        res.status(200).json({
        users: users.map(toClientUser),
        pagination: buildPaginationMeta(page, limit, total),
        counts: {
            all: activeCount + inactiveCount,
            active: activeCount,
            inactive: inactiveCount,
        },
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ msg: "Internal server error" });
    }
    };

    const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findOne({ _id: id, role: "customer" }).select("-password");

        if (!user) {
        return res.status(404).json({ msg: "User not found" });
        }

        const totalBookings = await Booking.countDocuments({ user: user._id });

        res.status(200).json({ user: { ...toClientUser(user), totalBookings } });
    } catch (error) {
        console.log(error);
        res.status(500).json({ msg: "Internal server error" });
    }
    };

    const updateUserStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (typeof status !== "boolean") {
        return res.status(400).json({ msg: "status must be true or false" });
        }

        const user = await User.findOneAndUpdate(
        { _id: id, role: "customer" },
        { isBlocked: !status },
        { new: true }
        ).select("-password");

        if (!user) {
        return res.status(404).json({ msg: "User not found" });
        }

        const totalBookings = await Booking.countDocuments({ user: user._id });

        res.status(200).json({
        msg: "User status updated",
        user: { ...toClientUser(user), totalBookings },
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ msg: "Internal server error" });
    }
    };

    
    const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, contact, address } = req.body;

        const updateData = {};
        if (name !== undefined && name !== "") updateData.name = name.trim();
        if (contact !== undefined) updateData.contact = contact.trim();
        if (address !== undefined) updateData.address = address.trim();

        const imagePath = getUploadedImagePath(req.file);
        if (imagePath) updateData.image = imagePath;

        if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ msg: "No changes provided" });
        }

        const user = await User.findOneAndUpdate(
        { _id: id, role: "customer" },
        updateData,
        { new: true, runValidators: true }
        ).select("-password");

        if (!user) {
        return res.status(404).json({ msg: "User not found" });
        }

        const totalBookings = await Booking.countDocuments({ user: user._id });

        res.status(200).json({
        msg: "User updated successfully",
        user: { ...toClientUser(user), totalBookings },
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ msg: "Internal server error" });
    }
    };

    const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findOneAndDelete({ _id: id, role: "customer" });

        if (!user) {
        return res.status(404).json({ msg: "User not found" });
        }

        res.status(200).json({ msg: "User deleted successfully" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ msg: "Internal server error" });
    }
    };

    const getAllVendors = async (req, res) => {
    try {
        const { status, q } = req.query;
        const { page, limit, skip } = getPagination(req.query);

        // baseFilter = role + search only, used for the tab counts so they
        // reflect the search term but not the currently selected tab.
        const baseFilter = { role: "vendor" };
        if (q && q.trim()) {
        const regex = { $regex: escapeRegex(q.trim()), $options: "i" };
        baseFilter.$or = [{ shop_name: regex }, { name: regex }, { email: regex }];
        }

        const filter = { ...baseFilter };
        if (status && status !== "all") filter.approvalStatus = status;

        const [vendors, total, pendingCount, approvedCount, rejectedCount] = await Promise.all([
        User.find(filter)
            .select("-password")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit),
        User.countDocuments(filter),
        User.countDocuments({ ...baseFilter, approvalStatus: "pending" }),
        User.countDocuments({ ...baseFilter, approvalStatus: "approved" }),
        User.countDocuments({ ...baseFilter, approvalStatus: "rejected" }),
        ]);

        res.status(200).json({
        vendors: vendors.map(toClientUser),
        pagination: buildPaginationMeta(page, limit, total),
        counts: {
            all: pendingCount + approvedCount + rejectedCount,
            pending: pendingCount,
            approved: approvedCount,
            rejected: rejectedCount,
        },
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ msg: "Internal server error" });
    }
    };

    const getVendorById = async (req, res) => {
    try {
        const { id } = req.params;
        const vendor = await User.findOne({ _id: id, role: "vendor" }).select("-password");

        if (!vendor) {
        return res.status(404).json({ msg: "Vendor not found" });
        }

        const [totalServices, totalBookings] = await Promise.all([
        VendorService.countDocuments({ vendor: vendor._id }),
        Booking.countDocuments({ vendor: vendor._id }),
        ]);

        res.status(200).json({
        vendor: { ...toClientUser(vendor), totalServices, totalBookings },
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ msg: "Internal server error" });
    }
    };

    const updateVendorApproval = async (req, res) => {
    try {
        const { id } = req.params;
        const { approvalStatus } = req.body;

        if (!["pending", "approved", "rejected"].includes(approvalStatus)) {
        return res.status(400).json({ msg: "Invalid approval status" });
        }

        const vendor = await User.findOneAndUpdate(
        { _id: id, role: "vendor" },
        { approvalStatus },
        { new: true }
        ).select("-password");

        if (!vendor) {
        return res.status(404).json({ msg: "Vendor not found" });
        }

        const [totalServices, totalBookings] = await Promise.all([
        VendorService.countDocuments({ vendor: vendor._id }),
        Booking.countDocuments({ vendor: vendor._id }),
        ]);

        res.status(200).json({
        msg: "Vendor approval updated",
        vendor: { ...toClientUser(vendor), totalServices, totalBookings },
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ msg: "Internal server error" });
    }
    };

    const updateVendorStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (typeof status !== "boolean") {
        return res.status(400).json({ msg: "status must be true or false" });
        }

        const vendor = await User.findOneAndUpdate(
        { _id: id, role: "vendor" },
        { isBlocked: !status },
        { new: true }
        ).select("-password");

        if (!vendor) {
        return res.status(404).json({ msg: "Vendor not found" });
        }

        const [totalServices, totalBookings] = await Promise.all([
        VendorService.countDocuments({ vendor: vendor._id }),
        Booking.countDocuments({ vendor: vendor._id }),
        ]);

        res.status(200).json({
        msg: "Vendor status updated",
        vendor: { ...toClientUser(vendor), totalServices, totalBookings },
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ msg: "Internal server error" });
    }
    };

    // Admin edit of a vendor's profile fields (shop name, owner name, phone,
    // address, avatar). Expects multipart/form-data when an image is included
    // (req.file via upload.single("image")); works fine without a file too.
    const updateVendor = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, shop_name, contact, address } = req.body;

        const updateData = {};
        if (name !== undefined && name !== "") updateData.name = name.trim();
        if (shop_name !== undefined && shop_name !== "") updateData.shop_name = shop_name.trim();
        if (contact !== undefined) updateData.contact = contact.trim();
        if (address !== undefined) updateData.address = address.trim();

        const imagePath = getUploadedImagePath(req.file);
        if (imagePath) updateData.image = imagePath;

        if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ msg: "No changes provided" });
        }

        const vendor = await User.findOneAndUpdate(
        { _id: id, role: "vendor" },
        updateData,
        { new: true, runValidators: true }
        ).select("-password");

        if (!vendor) {
        return res.status(404).json({ msg: "Vendor not found" });
        }

        const [totalServices, totalBookings] = await Promise.all([
        VendorService.countDocuments({ vendor: vendor._id }),
        Booking.countDocuments({ vendor: vendor._id }),
        ]);

        res.status(200).json({
        msg: "Vendor updated successfully",
        vendor: { ...toClientUser(vendor), totalServices, totalBookings },
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ msg: "Internal server error" });
    }
    };

    const deleteVendor = async (req, res) => {
    try {
        const { id } = req.params;
        const vendor = await User.findOneAndDelete({ _id: id, role: "vendor" });

        if (!vendor) {
        return res.status(404).json({ msg: "Vendor not found" });
        }

        res.status(200).json({ msg: "Vendor deleted successfully" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ msg: "Internal server error" });
    }
    };

    const addCategory = async (req, res) => {
    try {
        const { category_name, icon, description, fields } = req.body;

        if (!category_name) {
        return res.status(400).json({ msg: "Category name is required" });
        }

        const exists = await VendorCategory.findOne({
        category_name: category_name.trim(),
        });

        if (exists) {
        return res.status(400).json({ msg: "This category already exists" });
        }

        const category = await VendorCategory.create({
        category_name: category_name.trim(),
        icon,
        description,
        fields,
        });

        res.status(201).json({ msg: "Category added successfully", category });
    } catch (error) {
        console.log(error);
        res.status(500).json({ msg: "Internal server error" });
    }
    };

    const getAllCategories = async (req, res) => {
    try {
        const { q } = req.query;
        const { page, limit, skip } = getPagination(req.query);

        const filter = {};
        if (q && q.trim()) {
        filter.category_name = { $regex: escapeRegex(q.trim()), $options: "i" };
        }

        const [categories, total] = await Promise.all([
        VendorCategory.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit),
        VendorCategory.countDocuments(filter),
        ]);

        res.status(200).json({
        categories,
        pagination: buildPaginationMeta(page, limit, total),
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ msg: "Internal server error" });
    }
    };

    const getCategoryById = async (req, res) => {
    try {
        const { id } = req.params;
        const category = await VendorCategory.findById(id);

        if (!category) {
        return res.status(404).json({ msg: "Category not found" });
        }

        res.status(200).json({ category });
    } catch (error) {
        console.log(error);
        res.status(500).json({ msg: "Internal server error" });
    }
    };

    const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;

        const updatedCategory = await VendorCategory.findByIdAndUpdate(id, req.body, {
        new: true,
        });

        if (!updatedCategory) {
        return res.status(404).json({ msg: "Category not found" });
        }

        res.status(200).json({
        success: true,
        msg: "Category updated successfully",
        category: updatedCategory,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, msg: error.message });
    }
    };

    const updateCategoryStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (typeof status !== "boolean") {
        return res.status(400).json({ msg: "status must be true or false" });
        }

        const category = await VendorCategory.findByIdAndUpdate(id, { status }, { new: true });

        if (!category) {
        return res.status(404).json({ msg: "Category not found" });
        }

        res.status(200).json({ msg: "Category status updated", category });
    } catch (error) {
        console.log(error);
        res.status(500).json({ msg: "Internal server error" });
    }
    };

    const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;

        const category = await VendorCategory.findById(id);

        if (!category) {
        return res.status(404).json({ msg: "Category not found" });
        }

        const serviceExists = await VendorService.findOne({ category: id });

        if (serviceExists) {
        return res.status(400).json({
            msg: "This category has services linked to it. Remove those services first.",
        });
        }

        await VendorCategory.findByIdAndDelete(id);

        res.status(200).json({ msg: "Category deleted successfully" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ msg: "Internal server error" });
    }
    };

    const SERVICE_VENDOR_FIELDS = "shop_name name email image address contact approvalStatus";
    const SERVICE_CATEGORY_FIELDS = "category_name icon";

    const getAllServices = async (req, res) => {
    try {
        const { status, q } = req.query;
        const { page, limit, skip } = getPagination(req.query);

        // baseFilter = search only, used for tab counts so pending/approved/
        // rejected/all counts stay correct no matter which tab or page you're on.
        const baseFilter = {};
        if (q && q.trim()) {
        baseFilter.service_name = { $regex: escapeRegex(q.trim()), $options: "i" };
        }

        const filter = { ...baseFilter };
        if (status && status !== "all") filter.approvalStatus = status;

        const [services, total, pendingCount, approvedCount, rejectedCount] = await Promise.all([
        VendorService.find(filter)
            .populate("vendor", SERVICE_VENDOR_FIELDS)
            .populate("category", SERVICE_CATEGORY_FIELDS)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit),
        VendorService.countDocuments(filter),
        VendorService.countDocuments({ ...baseFilter, approvalStatus: "pending" }),
        VendorService.countDocuments({ ...baseFilter, approvalStatus: "approved" }),
        VendorService.countDocuments({ ...baseFilter, approvalStatus: "rejected" }),
        ]);

        res.status(200).json({
        services,
        pagination: buildPaginationMeta(page, limit, total),
        counts: {
            all: pendingCount + approvedCount + rejectedCount,
            pending: pendingCount,
            approved: approvedCount,
            rejected: rejectedCount,
        },
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ msg: "Internal server error" });
    }
    };

    const getServiceById = async (req, res) => {
    try {
        const { id } = req.params;
        const service = await VendorService.findById(id)
        .populate("vendor", SERVICE_VENDOR_FIELDS)
        .populate("category", SERVICE_CATEGORY_FIELDS);

        if (!service) {
        return res.status(404).json({ msg: "Service not found" });
        }

        res.status(200).json({ service });
    } catch (error) {
        console.log(error);
        res.status(500).json({ msg: "Internal server error" });
    }
    };

    const updateServiceApproval = async (req, res) => {
    try {
        const { id } = req.params;
        const { approvalStatus } = req.body;

        if (!["pending", "approved", "rejected"].includes(approvalStatus)) {
        return res.status(400).json({ msg: "Invalid approval status" });
        }

        const existingService = await VendorService.findById(id).populate(
        "vendor",
        "approvalStatus shop_name name"
        );

        if (!existingService) {
        return res.status(404).json({ msg: "Service not found" });
        }

        // Jab tak vendor khud approve nahi hua, uski koi bhi service
        // "approved" mein nahi jaa sakti. Reject / pending karne pe koi
        // rok nahi — sirf approve karte waqt ye check lagta hai.
        if (
        approvalStatus === "approved" &&
        existingService.vendor?.approvalStatus !== "approved"
        ) {
        return res.status(400).json({
            msg: "This vendor is not approved yet. Approve the vendor first, then approve their service.",
            vendorNotApproved: true,
            vendorId: existingService.vendor?._id,
        });
        }

        const service = await VendorService.findByIdAndUpdate(
        id,
        { approvalStatus },
        { new: true }
        )
        .populate("vendor", SERVICE_VENDOR_FIELDS)
        .populate("category", SERVICE_CATEGORY_FIELDS);

        res.status(200).json({ msg: "Service approval updated", service });
    } catch (error) {
        console.log(error);
        res.status(500).json({ msg: "Internal server error" });
    }
    };

    const deleteService = async (req, res) => {
    try {
        const { id } = req.params;
        const service = await VendorService.findByIdAndDelete(id);

        if (!service) {
        return res.status(404).json({ msg: "Service not found" });
        }

        res.status(200).json({ msg: "Service deleted successfully" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ msg: "Internal server error" });
    }
    };

    const BOOKING_USER_FIELDS = "name email image contact";
    const BOOKING_SERVICE_FIELDS = "service_name image price";
    const BOOKING_STATUSES = ["pending", "confirmed", "completed", "cancelled"];

    // Admin listing of bookings, always scoped down to a single vendor via
    // ?vendor=<vendorId> (that's how the "Bookings" page under a vendor's
    // profile stays limited to services THAT vendor's customers actually
    // booked, instead of every service the vendor has ever listed).
    // Also supports the usual status tabs / search / pagination pattern
    // used by the other admin list endpoints above.
    const getAllBookings = async (req, res) => {
    try {
        const { vendor, status, q } = req.query;
        const { page, limit, skip } = getPagination(req.query);

        // baseFilter = vendor + search only, used for the tab counts so they
        // stay correct no matter which status tab or page is selected.
        const baseFilter = {};
        if (vendor) baseFilter.vendor = vendor;

        if (q && q.trim()) {
        const regex = { $regex: escapeRegex(q.trim()), $options: "i" };

        const [matchingUsers, matchingServices] = await Promise.all([
            User.find({ role: "customer", $or: [{ name: regex }, { email: regex }] }).select("_id"),
            VendorService.find({ service_name: regex }).select("_id"),
        ]);

        baseFilter.$or = [
            { user: { $in: matchingUsers.map((u) => u._id) } },
            { service: { $in: matchingServices.map((s) => s._id) } },
        ];
        }

        const filter = { ...baseFilter };
        if (status && status !== "all") filter.status = status;

        const [bookings, total, pendingCount, confirmedCount, completedCount, cancelledCount] =
        await Promise.all([
            Booking.find(filter)
            .populate("user", BOOKING_USER_FIELDS)
            .populate("service", BOOKING_SERVICE_FIELDS)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit),
            Booking.countDocuments(filter),
            Booking.countDocuments({ ...baseFilter, status: "pending" }),
            Booking.countDocuments({ ...baseFilter, status: "confirmed" }),
            Booking.countDocuments({ ...baseFilter, status: "completed" }),
            Booking.countDocuments({ ...baseFilter, status: "cancelled" }),
        ]);

        // `customer` alias added alongside `user` so the admin frontend can
        // read booking.customer without caring what the schema calls it.
        const formattedBookings = bookings.map((b) => {
        const obj = b.toObject();
        return { ...obj, customer: obj.user };
        });

        res.status(200).json({
        bookings: formattedBookings,
        pagination: buildPaginationMeta(page, limit, total),
        counts: {
            all: pendingCount + confirmedCount + completedCount + cancelledCount,
            pending: pendingCount,
            confirmed: confirmedCount,
            completed: completedCount,
            cancelled: cancelledCount,
        },
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ msg: "Internal server error" });
    }
    };

    module.exports = {
    getDashboardSummary,
    getAllUsers,
    getUserById,
    updateUserStatus,
    updateUser,
    deleteUser,
    getAllVendors,
    getVendorById,
    updateVendorApproval,
    updateVendorStatus,
    updateVendor,
    deleteVendor,
    addCategory,
    getAllCategories,
    getCategoryById,
    updateCategory,
    updateCategoryStatus,
    deleteCategory,
    getAllServices,
    getServiceById,
    updateServiceApproval,
    deleteService,
    getAllBookings,
    };