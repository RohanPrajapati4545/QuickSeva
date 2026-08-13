const bcrypt = require("bcrypt");
const User = require("../models/userSchema");
const cloudinary = require("cloudinary").v2;

// Extracts the Cloudinary public_id from a stored secure_url so we can
// delete the actual asset from Cloudinary (not from local disk).
const getPublicIdFromUrl = (url) => {
  if (!url || !/^https?:\/\//i.test(url)) return null;
  try {
    const parts = url.split("/upload/")[1];  
    if (!parts) return null;
    const withoutVersion = parts.replace(/^v\d+\//, "");  
    const withoutExt = withoutVersion.replace(/\.[^/.]+$/, "");  
    return withoutExt;
  } catch {
    return null;
  }
};

const removeFile = async (imageUrl) => {
  const publicId = getPublicIdFromUrl(imageUrl);
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    console.log("Cloudinary delete failed:", err.message);
  }
};

 
const getProfile = async (req, res) => {
  try {
   
    const vendorId = req.user.id || req.user._id;

    const user = await User.findById(vendorId).select("-password");
    if (!user) {
      return res.status(404).json({ msg: "Vendor not found" });
    }

    res.status(200).json({ user });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Internal server error" });
  }
};

// ================= UPDATE PROFILE =================
const updateProfile = async (req, res) => {
  try {
    const vendorId = req.user.id || req.user._id;
    const { name, phone, shop_name, address } = req.body;

    const existing = await User.findById(vendorId);
    if (!existing) {
      return res.status(404).json({ msg: "Vendor not found" });
    }

    const updateData = { name, phone, shop_name, address };

    if (req.file) {
      updateData.image = req.file.path; // Cloudinary secure URL
      await removeFile(existing.image); // purani Cloudinary image delete karo
    }

    const updatedUser = await User.findByIdAndUpdate(vendorId, updateData, {
      new: true,
    }).select("-password");

    res.status(200).json({
      success: true,
      msg: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, msg: error.message });
  }
};

// ================= CHANGE PASSWORD =================
const changePassword = async (req, res) => {
  try {
    const vendorId = req.user.id || req.user._id;
    const { current_password, new_password } = req.body;

    if (!current_password || !new_password) {
      return res.status(400).json({ msg: "Both current and new password are required" });
    }
    if (new_password.length < 6) {
      return res.status(400).json({ msg: "New password must be at least 6 characters" });
    }

    const user = await User.findById(vendorId);
    if (!user) {
      return res.status(404).json({ msg: "Vendor not found" });
    }

    const isMatch = await bcrypt.compare(current_password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Current password is incorrect" });
    }

    const hashed = await bcrypt.hash(new_password, 10);
    user.password = hashed;
    await user.save();

    res.status(200).json({ msg: "Password changed successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Internal server error" });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  changePassword,
};