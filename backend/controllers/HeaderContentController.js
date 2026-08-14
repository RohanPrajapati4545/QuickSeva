const HeaderContent = require("./../models/HeaderContentSchema");

const getOrCreateHeaderContent = async () => {
  let content = await HeaderContent.findOne();
  if (!content) {
    content = await HeaderContent.create({});
  }
  return content;
};

const parseArrayField = (value, fieldName) => {
  let parsed = value;
  if (typeof value === "string") {
    try {
      parsed = JSON.parse(value);
    } catch (e) {
      throw new Error(`${fieldName} must be valid JSON`);
    }
  }
  if (!Array.isArray(parsed)) {
    throw new Error(`${fieldName} must be an array`);
  }
  return parsed;
};

// PUBLIC — used by the site header on every page load
exports.getHeaderContent = async (req, res) => {
  try {
    const content = await getOrCreateHeaderContent();
    res.status(200).json({ content });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Failed to fetch header content" });
  }
};

// ADMIN ONLY
exports.updateHeaderContent = async (req, res) => {
  try {
    const { logoText, logoIcon, navLinks, ctaText, ctaLink, topBarText } = req.body;

    const content = await getOrCreateHeaderContent();

    if (logoText !== undefined) content.logoText = logoText;
    if (logoIcon !== undefined) content.logoIcon = logoIcon;
    if (ctaText !== undefined) content.ctaText = ctaText;
    if (ctaLink !== undefined) content.ctaLink = ctaLink;
    if (topBarText !== undefined) content.topBarText = topBarText;

    if (navLinks !== undefined) {
      const parsed = parseArrayField(navLinks, "navLinks");
      content.navLinks = parsed.map((l) => ({
        label: l.label || "",
        path: l.path || "/",
      }));
    }

    await content.save();
    res.status(200).json({ content, msg: "Header content updated successfully" });
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: error.message || "Failed to update header content" });
  }
};