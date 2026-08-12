const bcrypt = require("bcrypt");
const User = require("../models/userSchema");

 
const getProfile = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    res.status(200).json({ user });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Internal server error" });
  }
};

// ================= UPDATE PROFILE (name, phone, address, image) =================
const updateProfile = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    const { name, phone, address } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    if (name !== undefined) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (address !== undefined) user.address = address;

  if (req.file) {
  user.image = req.file.path;  
}

    await user.save();

    const { password, ...safeUser } = user.toObject();
    res.status(200).json({ msg: "Profile updated", user: safeUser });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Internal server error" });
  }
};

 
const changePassword = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    const { current_password, new_password } = req.body;

    if (!current_password || !new_password) {
      return res.status(400).json({ msg: "Both current and new password are required" });
    }
    if (new_password.length < 6) {
      return res.status(400).json({ msg: "New password must be at least 6 characters" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    const isMatch = await bcrypt.compare(current_password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Current password is incorrect" });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(new_password, salt);
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