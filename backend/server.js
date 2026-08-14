const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const cors = require("cors");
require("./config/db");

const app = express();

app.disable("etag");
const corsOption = {
  origin: [
    "http://localhost:3000",
    "http://localhost:5173",
    "https://quick-seva-git-main-rohanprajjapati-5449s-projects.vercel.app",
    process.env.CLIENT_URL,
  ].filter(Boolean),
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  credentials: true,
};

app.use(cors(corsOption));

app.use(express.json());

app.use("/uploads", express.static("uploads"));

// Routes
const AuthRoute = require("./routes/AuthRoute");
const VendorCategoryRoute = require("./routes/vendorCategoryRoute");
const VendorServiceRoute = require("./routes/vendorServiceRoute");
const VendorProfileRoute = require("./routes/vendorProfileRoute");
const UserRoute = require("./routes/userRoute");
const VendorBookingRoute = require("./routes/vendorBookingRoute");
const UserProfileRoute = require("./routes/userProfileRoute");
const AdminRoute = require("./routes/AdminRoute");
const ContentRoute = require("./routes/ContentRoutes");

app.use("/api/auth", AuthRoute);
app.use("/api/vendor", VendorCategoryRoute);
app.use("/api/vendor-service", VendorServiceRoute);
app.use("/api/vendor-profile", VendorProfileRoute);
app.use("/api/user", UserRoute);
app.use("/api/vendor-booking", VendorBookingRoute);
app.use("/api/user-profile", UserProfileRoute);
app.use("/api/admin", AdminRoute);
app.use("/api/content", ContentRoute);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server Running on ${PORT}`);
});