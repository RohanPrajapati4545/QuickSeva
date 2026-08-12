const userSchema = require("./../models/userSchema");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const register = async (req, res) => {
  try {
    const { name, email, password, confirm_password, contact, role } = req.body;

    if (!name || !email || !password || !confirm_password || !contact) {
      return res.status(400).json({ msg: "All fields are required" });
    }

    if (password !== confirm_password) {
      return res.status(400).json({ msg: "Password and confirm password do not match" });
    }

    const userExists = await userSchema.findOne({ email });
    if (userExists) {
      return res.status(400).json({ msg: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const DEFAULT_AVATAR_BASE = "https://ui-avatars.com/api/";
    const image = req.file?.path ;

    const newUser = new userSchema({
      name,
      email,
      password: hashedPassword,
      contact,
      image,
      role: role || "customer",
    });

    const dataCreated = await newUser.save();

    res.status(201).json({ msg: "User Registered Successfully", user: dataCreated });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Internal server error" });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ msg: "All fields are required" });
    }

    const userExist = await userSchema.findOne({ email });
    if (!userExist) {
      return res.status(400).json({ msg: "You are not a registered user" });
    }

    if (userExist.isBlocked) {
      return res.status(403).json({ msg: "You have been blocked by admin" });
    }

    const passwordMatch = await bcrypt.compare(password, userExist.password);
    if (!passwordMatch) {
      return res.status(400).json({ msg: "Email or password invalid" });
    }

    const token = jwt.sign(
      { id: userExist._id, email: userExist.email, role: userExist.role },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "24h" }
    );

    res.status(200).json({ msg: "You have logged in", token, user: userExist });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Internal server error" });
  }
}; 

module.exports = { register, login };