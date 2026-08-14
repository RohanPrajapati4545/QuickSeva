const mongoose = require("mongoose");

// One value/mission point (icon + title + desc, same shape as whyUs on home)
const aboutValueSchema = new mongoose.Schema(
  {
    icon: { type: String, default: "fa-heart" },
    title: { type: String, default: "" },
    desc: { type: String, default: "" },
  },
  { _id: false }
);

// One team member card
const teamMemberSchema = new mongoose.Schema(
  {
    name: { type: String, default: "" },
    role: { type: String, default: "" },
    photo: { type: String, default: "" }, // image URL
  },
  { _id: false }
);

// One stat (e.g. "50,000+ Homes served")
const aboutStatSchema = new mongoose.Schema(
  {
    number: { type: String, default: "" },
    label: { type: String, default: "" },
  },
  { _id: false }
);

const AboutContentSchema = new mongoose.Schema(
  {
    // ===== HERO =====
    heroBadgeText: { type: String, default: "Our story" },
    heroTitle: { type: String, default: "Built to make home help simple." },
    heroSubtitle: {
      type: String,
      default: "QuickSeva connects verified professionals with homes that need them — fast, transparent and fair.",
    },

    // ===== STORY =====
    storyEyebrow: { type: String, default: "How we started" },
    storyTitle: { type: String, default: "Our story" },
    storyText: {
      type: String,
      default: "QuickSeva started with a simple frustration: finding a reliable electrician or plumber shouldn't take a day of phone calls.",
    },

    // ===== MISSION =====
    missionEyebrow: { type: String, default: "What drives us" },
    missionTitle: { type: String, default: "Our mission" },
    missionText: {
      type: String,
      default: "To make every home service booking transparent, verified and stress-free — for customers and vendors alike.",
    },

    // ===== VALUES =====
    valuesEyebrow: { type: String, default: "What we stand for" },
    valuesTitle: { type: String, default: "Our values" },
    values: {
      type: [aboutValueSchema],
      default: [
        { icon: "fa-shield-halved", title: "Trust first", desc: "Every vendor is verified before they take a single booking." },
        { icon: "fa-scale-balanced", title: "Fair pricing", desc: "No hidden charges, no surprise fees — ever." },
        { icon: "fa-people-group", title: "Community", desc: "We back local professionals with steady, dignified work." },
      ],
    },

    // ===== STATS =====
    stats: {
      type: [aboutStatSchema],
      default: [
        { number: "50,000+", label: "Homes served" },
        { number: "2,500+", label: "Verified vendors" },
        { number: "15+", label: "Cities" },
      ],
    },

    // ===== TEAM =====
    teamEyebrow: { type: String, default: "The people behind it" },
    teamTitle: { type: String, default: "Meet the team" },
    team: {
      type: [teamMemberSchema],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("AboutContent", AboutContentSchema);