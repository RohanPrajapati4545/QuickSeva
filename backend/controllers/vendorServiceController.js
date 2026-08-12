const VendorService = require("../models/vendorServiceSchema");
const fs = require("fs");
const path = require("path");

const parseCustomFields = (raw) => {
  if (!raw) return {};
  if (typeof raw === "object") return raw;
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
};

const removeFile = (relativePath) => {
  if (!relativePath) return;
  const fullPath = path.join(process.cwd(), relativePath.replace(/^\//, ""));
  fs.unlink(fullPath, () => {});
};

const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const addService = async (req, res) => {
  try {
    const vendorId = req.user.id;
    const { category, service_name, description, price } = req.body;

    if (!category || !service_name || !price) {
      return res.status(400).json({
        msg: "Category, service name and price are required",
      });
    }

    const image = req.file ? `/uploads/${req.file.filename}` : "";

    const service = await VendorService.create({
      vendor: vendorId,
      category,
      service_name: service_name.trim(),
      description,
      price,
      image,
      custom_fields: parseCustomFields(req.body.custom_fields),
      approvalStatus: "pending",
    });

    res.status(201).json({
      msg: "Service submitted for approval",
      service,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Internal server error" });
  }
};

const getAllServices = async (req, res) => {
  try {
    const vendorId = req.user.id;
    const { q } = req.query;

    const filter = { vendor: vendorId };

    if (q && q.trim()) {
      filter.service_name = { $regex: escapeRegex(q.trim()), $options: "i" };
    }

    const services = await VendorService.find(filter)
      .populate("category", "category_name icon")
      .sort({ createdAt: -1 });

    res.status(200).json({ services });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Internal server error" });
  }
};

const getServiceById = async (req, res) => {
  try {
    const { id } = req.params;

    const service = await VendorService.findById(id).populate("category");

    if (!service) {
      return res.status(404).json({ msg: "Service not found" });
    }

    res.status(200).json({ service });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Internal server error" });
  }
};

const updateService = async (req, res) => {
  try {
    const { id } = req.params;
    const vendorId = req.user.id;
    const { category, service_name, description, price } = req.body;

    const existing = await VendorService.findOne({ _id: id, vendor: vendorId });
    if (!existing) {
      return res.status(404).json({ msg: "Service not found" });
    }

    const updateData = {
      category,
      service_name: service_name?.trim(),
      description,
      price,
      custom_fields: parseCustomFields(req.body.custom_fields),
      approvalStatus: "pending",
    };

    if (req.file) {
      updateData.image = `/uploads/${req.file.filename}`;
      removeFile(existing.image);
    }

    const updatedService = await VendorService.findOneAndUpdate(
      { _id: id, vendor: vendorId },
      updateData,
      { new: true }
    );

    res.status(200).json({
      success: true,
      msg: "Service updated and sent for re-approval",
      service: updatedService,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, msg: error.message });
  }
};

const deleteService = async (req, res) => {
  try {
    const { id } = req.params;
    const vendorId = req.user.id;

    const service = await VendorService.findOne({ _id: id, vendor: vendorId });
    if (!service) {
      return res.status(404).json({ msg: "Service not found" });
    }

    await VendorService.findByIdAndDelete(id);
    removeFile(service.image);

    res.status(200).json({ msg: "Service deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Internal server error" });
  }
};

const updateServiceStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const vendorId = req.user.id;

    const service = await VendorService.findOneAndUpdate(
      { _id: id, vendor: vendorId },
      { status },
      { new: true }
    );

    if (!service) {
      return res.status(404).json({ msg: "Service not found" });
    }

    res.status(200).json({
      success: true,
      msg: "Service status updated",
      service,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, msg: "Internal server error" });
  }
};

module.exports = {
  addService,
  getAllServices,
  getServiceById,
  updateService,
  deleteService,
  updateServiceStatus,
};