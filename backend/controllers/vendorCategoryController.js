const VendorCategory = require("../models/VendorCategorySchema");

const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const getAllCategories = async (req, res) => {
  try {
    const { q } = req.query;

    const filter = { status: true };

    if (q && q.trim()) {
      filter.category_name = { $regex: escapeRegex(q.trim()), $options: "i" };
    }

    const categories = await VendorCategory.find(filter).sort({ category_name: 1 });

    res.status(200).json({
      categories,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      msg: "Internal server error",
    });
  }
};

module.exports = {
  getAllCategories,
};