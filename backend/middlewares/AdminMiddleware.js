const adminMiddleware = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        msg: "Unauthorized. Please login first.",
      });
    }

    if (req.user.role !== "admin") {
      return res.status(403).json({
        msg: "Access denied. Admins only.",
      });
    }

    next();
  } catch (error) {
    console.log(error);
    res.status(500).json({
      msg: "Internal server error",
    });
  }
};

module.exports = adminMiddleware;