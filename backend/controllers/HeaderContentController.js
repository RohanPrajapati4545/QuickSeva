const HeaderContent = require("./../models/HeaderContentSchema");

const getOrCreateHeaderContent = async () => {
  let content = await HeaderContent.findOne();
  if (!content) {
    content = await HeaderContent.create({});
  }
  return content;
};

// Only these two fields are actually used anywhere in the app right now.
// Everything else on the schema (logoIcon, ctaText, ctaLink, topBarText,
// navLinks, etc.) is legacy/unused — this trims the response down so
// clients only ever see what they need.
const pickPublicFields = (content) => ({
  logoText: content.logoText || "",
  logoImage: content.logoImage || "",
});

// PUBLIC — used by Header.jsx on every page load
exports.getHeaderContent = async (req, res) => {
  try {
    const content = await getOrCreateHeaderContent();
    res.status(200).json({ content: pickPublicFields(content) });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Failed to fetch header content" });
  }
};

// ADMIN ONLY — multipart/form-data when a new logo file is sent,
// upload.single("logoImage") (Cloudinary storage) runs before this
exports.updateHeaderContent = async (req, res) => {
  try {
    const { logoText } = req.body;

    const content = await getOrCreateHeaderContent();

    if (logoText !== undefined) content.logoText = logoText;

    // req.file.path is already a full Cloudinary URL — store as-is
    if (req.file) {
      content.logoImage = req.file.path;
    }

    await content.save();
    res.status(200).json({
      content: pickPublicFields(content),
      msg: "Header content updated successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: error.message || "Failed to update header content" });
  }
};