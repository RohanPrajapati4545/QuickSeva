const bcrypt = require("bcrypt"); 
const User = require("../models/userSchema");  
const fs = require("fs");
const path = require("path");

const removeFile = (relativePath) => {
  if (!relativePath) return;
  const fullPath = path.join(process.cwd(), relativePath.replace(/^\//, ""));
  fs.unlink(fullPath, () => {});  
};

 
const getProfile = async (req, res) => {
  try {
    const vendorId = req.user.id;

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
    const vendorId = req.user.id;
    const { name, phone, shop_name, address } = req.body;

    const existing = await User.findById(vendorId);
    if (!existing) {
      return res.status(404).json({ msg: "Vendor not found" });
    }

    const updateData = { name, phone, shop_name, address };

    if (req.file) {
      updateData.image = `/uploads/${req.file.filename}`;
      removeFile(existing.image); // purani image hata do
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
    const vendorId = req.user.id;
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