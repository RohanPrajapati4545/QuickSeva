const AboutContent = require("./../models/AboutContentSchema");

const getOrCreateAboutContent = async () => {
  let content = await AboutContent.findOne();
  if (!content) {
    content = await AboutContent.create({});
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

// PUBLIC — used by About.jsx on page load
exports.getAboutContent = async (req, res) => {
  try {
    const content = await getOrCreateAboutContent();
    res.status(200).json({ content });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Failed to fetch about content" });
  }
};

// ADMIN ONLY
exports.updateAboutContent = async (req, res) => {
  try {
    const {
      heroBadgeText,
      heroTitle,
      heroSubtitle,
      storyEyebrow,
      storyTitle,
      storyText,
      missionEyebrow,
      missionTitle,
      missionText,
      valuesEyebrow,
      valuesTitle,
      values,
      stats,
      teamEyebrow,
      teamTitle,
      team,
    } = req.body;

    const content = await getOrCreateAboutContent();

    if (heroBadgeText !== undefined) content.heroBadgeText = heroBadgeText;
    if (heroTitle !== undefined) content.heroTitle = heroTitle;
    if (heroSubtitle !== undefined) content.heroSubtitle = heroSubtitle;

    if (storyEyebrow !== undefined) content.storyEyebrow = storyEyebrow;
    if (storyTitle !== undefined) content.storyTitle = storyTitle;
    if (storyText !== undefined) content.storyText = storyText;

    if (missionEyebrow !== undefined) content.missionEyebrow = missionEyebrow;
    if (missionTitle !== undefined) content.missionTitle = missionTitle;
    if (missionText !== undefined) content.missionText = missionText;

    if (valuesEyebrow !== undefined) content.valuesEyebrow = valuesEyebrow;
    if (valuesTitle !== undefined) content.valuesTitle = valuesTitle;

    if (teamEyebrow !== undefined) content.teamEyebrow = teamEyebrow;
    if (teamTitle !== undefined) content.teamTitle = teamTitle;

    if (values !== undefined) {
      const parsed = parseArrayField(values, "values");
      content.values = parsed.map((v) => ({
        icon: v.icon || "fa-heart",
        title: v.title || "",
        desc: v.desc || "",
      }));
    }

    if (stats !== undefined) {
      const parsed = parseArrayField(stats, "stats");
      content.stats = parsed.map((s) => ({
        number: s.number || "",
        label: s.label || "",
      }));
    }

    if (team !== undefined) {
      const parsed = parseArrayField(team, "team");
      content.team = parsed.map((t) => ({
        name: t.name || "",
        role: t.role || "",
        photo: t.photo || "",
      }));
    }

    await content.save();
    res.status(200).json({ content, msg: "About content updated successfully" });
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: error.message || "Failed to update about content" });
  }
};