const ContactContent = require("./../models/ContactContentSchema");

const getOrCreateContactContent = async () => {
  let content = await ContactContent.findOne();
  if (!content) {
    content = await ContactContent.create({});
  }
  return content;
};

// PUBLIC — used by Contact.jsx on page load
exports.getContactContent = async (req, res) => {
  try {
    const content = await getOrCreateContactContent();
    res.status(200).json({ content });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Failed to fetch contact content" });
  }
};

// ADMIN ONLY
exports.updateContactContent = async (req, res) => {
  try {
    const {
      heroBadgeText,
      heroTitle,
      heroSubtitle,
      phone,
      email,
      address,
      mapEmbedUrl,
      officeHours,
      formHeading,
      formSubheading,
    } = req.body;

    const content = await getOrCreateContactContent();

    if (heroBadgeText !== undefined) content.heroBadgeText = heroBadgeText;
    if (heroTitle !== undefined) content.heroTitle = heroTitle;
    if (heroSubtitle !== undefined) content.heroSubtitle = heroSubtitle;
    if (phone !== undefined) content.phone = phone;
    if (email !== undefined) content.email = email;
    if (address !== undefined) content.address = address;
    if (mapEmbedUrl !== undefined) content.mapEmbedUrl = mapEmbedUrl;
    if (officeHours !== undefined) content.officeHours = officeHours;
    if (formHeading !== undefined) content.formHeading = formHeading;
    if (formSubheading !== undefined) content.formSubheading = formSubheading;

    await content.save();
    res.status(200).json({ content, msg: "Contact content updated successfully" });
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: error.message || "Failed to update contact content" });
  }
};