const HomeContent = require("./../models/HomeContentSchema");

// There is only ever ONE home-content document (site-wide singleton).
// If it doesn't exist yet (fresh DB), create it with schema defaults
// the first time anyone asks for it.
const getOrCreateHomeContent = async () => {
  let content = await HomeContent.findOne();
  if (!content) {
    content = await HomeContent.create({});
  }
  return content;
};

// helper: parse a field that may arrive as a real array or as a JSON string
// (e.g. sent via multipart/form-data alongside a file upload)
const parseArrayField = (value, fieldName, expectedLength) => {
  let parsed = value;

  if (typeof value === "string") {
    try {
      parsed = JSON.parse(value);
    } catch (e) {
      throw new Error(`${fieldName} must be valid JSON`);
    }
  }

  if (!Array.isArray(parsed) || parsed.length !== expectedLength) {
    throw new Error(`${fieldName} must be an array of exactly ${expectedLength} items`);
  }

  return parsed;
};

// PUBLIC — called by Home.jsx on page load. No auth required, anyone
// visiting the site needs to be able to fetch the current content.
// Mounted on the public router (see HomeContentRoutes.js).
exports.getHomeContent = async (req, res) => {
  try {
    const content = await getOrCreateHomeContent();
    res.status(200).json({ content });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Failed to fetch home content" });
  }
};

// ADMIN ONLY — called from the admin panel's home content editor.
// Mounted on AdminRoutes.js behind authMiddleware + adminMiddleware.
// Every field is optional; only whatever is sent in the body gets
// updated, so the admin can change just the hero copy, or just the
// reviews, etc.
exports.updateHomeContent = async (req, res) => {
  try {
    const {
      heroBadgeText,
      heroTitleLine1,
      heroTitleLine2,
      heroSubtitle,
      heroSearchPlaceholder,
      heroSearchButtonText,
      heroCtaPrimaryText,
      heroCtaGhostText,

      servicesEyebrow,
      servicesTitle,
      servicesSubtitle,

      whyUsEyebrow,
      whyUsTitle,
      whyUs, // array of exactly 4 { icon, title, desc } — or a JSON string of that array

      howItWorksEyebrow,
      howItWorksTitle,
      howItWorks, // array of exactly 3 { n, icon, title, desc } — or a JSON string of that array

      vendorsEyebrow,
      vendorsTitle,

      reviewsEyebrow,
      reviewsTitle,
      reviews, // array of exactly 3 { name, role, quote } — or a JSON string of that array

      appEyebrow,
      appTitle,
      appSubtitle,
      appStoreText,
      googlePlayText,
    } = req.body;

    const content = await getOrCreateHomeContent();

    if (heroBadgeText !== undefined) content.heroBadgeText = heroBadgeText;
    if (heroTitleLine1 !== undefined) content.heroTitleLine1 = heroTitleLine1;
    if (heroTitleLine2 !== undefined) content.heroTitleLine2 = heroTitleLine2;
    if (heroSubtitle !== undefined) content.heroSubtitle = heroSubtitle;
    if (heroSearchPlaceholder !== undefined) content.heroSearchPlaceholder = heroSearchPlaceholder;
    if (heroSearchButtonText !== undefined) content.heroSearchButtonText = heroSearchButtonText;
    if (heroCtaPrimaryText !== undefined) content.heroCtaPrimaryText = heroCtaPrimaryText;
    if (heroCtaGhostText !== undefined) content.heroCtaGhostText = heroCtaGhostText;

    if (servicesEyebrow !== undefined) content.servicesEyebrow = servicesEyebrow;
    if (servicesTitle !== undefined) content.servicesTitle = servicesTitle;
    if (servicesSubtitle !== undefined) content.servicesSubtitle = servicesSubtitle;

    if (whyUsEyebrow !== undefined) content.whyUsEyebrow = whyUsEyebrow;
    if (whyUsTitle !== undefined) content.whyUsTitle = whyUsTitle;

    if (howItWorksEyebrow !== undefined) content.howItWorksEyebrow = howItWorksEyebrow;
    if (howItWorksTitle !== undefined) content.howItWorksTitle = howItWorksTitle;

    if (vendorsEyebrow !== undefined) content.vendorsEyebrow = vendorsEyebrow;
    if (vendorsTitle !== undefined) content.vendorsTitle = vendorsTitle;

    if (reviewsEyebrow !== undefined) content.reviewsEyebrow = reviewsEyebrow;
    if (reviewsTitle !== undefined) content.reviewsTitle = reviewsTitle;

    if (appEyebrow !== undefined) content.appEyebrow = appEyebrow;
    if (appTitle !== undefined) content.appTitle = appTitle;
    if (appSubtitle !== undefined) content.appSubtitle = appSubtitle;
    if (appStoreText !== undefined) content.appStoreText = appStoreText;
    if (googlePlayText !== undefined) content.googlePlayText = googlePlayText;

    if (whyUs !== undefined) {
      const parsed = parseArrayField(whyUs, "whyUs", 4);
      content.whyUs = parsed.map((w) => ({
        icon: w.icon || "fa-shield-halved",
        title: w.title || "",
        desc: w.desc || "",
      }));
    }

    if (howItWorks !== undefined) {
      const parsed = parseArrayField(howItWorks, "howItWorks", 3);
      content.howItWorks = parsed.map((s) => ({
        n: s.n || "01",
        icon: s.icon || "fa-magnifying-glass",
        title: s.title || "",
        desc: s.desc || "",
      }));
    }

    if (reviews !== undefined) {
      const parsed = parseArrayField(reviews, "reviews", 3);
      content.reviews = parsed.map((r) => ({
        name: r.name || "",
        role: r.role || "",
        quote: r.quote || "",
      }));
    }

    await content.save();

    res.status(200).json({ content, msg: "Home content updated successfully" });
  } catch (error) {
    console.log(error);
    // validation errors thrown by parseArrayField come through here with a helpful message
    res.status(400).json({ msg: error.message || "Failed to update home content" });
  }
};