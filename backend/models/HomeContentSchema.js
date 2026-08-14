const mongoose = require("mongoose");

// One "why us" reason card (the 4 boxes under "Built for trust, not just convenience")
const whyUsSchema = new mongoose.Schema(
  {
    icon: { type: String, default: "fa-shield-halved" }, // font-awesome class, WITHOUT the "fa-solid" prefix e.g. "fa-shield-halved"
    title: { type: String, default: "" },
    desc: { type: String, default: "" },
  },
  { _id: false }
);

// One "how it works" step (the 3 steps: Book / Vendor assigned / Service completed)
const howItWorksStepSchema = new mongoose.Schema(
  {
    n: { type: String, default: "01" }, // step number label e.g. "01"
    icon: { type: String, default: "fa-magnifying-glass" },
    title: { type: String, default: "" },
    desc: { type: String, default: "" },
  },
  { _id: false }
);

// One customer review card
const reviewSchema = new mongoose.Schema(
  {
    name: { type: String, default: "" },
    role: { type: String, default: "" },
    quote: { type: String, default: "" },
  },
  { _id: false }
);

const HomeContentSchema = new mongoose.Schema(
  {
    // ===== HERO (top section — left copy + search bar + right orbit graphic) =====
    heroBadgeText: { type: String, default: "Trusted by 50,000+ homes" },
    heroTitleLine1: { type: String, default: "Every home fix," },
    heroTitleLine2: { type: String, default: "one tap away." },
    heroSubtitle: {
      type: String,
      default:
        "From a tripped fuse to a full home clean — book verified electricians, plumbers, mechanics and repair experts near you, with the price shown before you confirm.",
    },
    heroSearchPlaceholder: { type: String, default: "What do you need fixed?" },
    heroSearchButtonText: { type: String, default: "Search" },
    heroCtaPrimaryText: { type: String, default: "Book a Service" },
    heroCtaGhostText: { type: String, default: "Become a Vendor" },

    // ===== SERVICES SECTION HEADER (category grid — data itself stays live from /categories) =====
    servicesEyebrow: { type: String, default: "What we offer" },
    servicesTitle: { type: String, default: "Popular services" },
    servicesSubtitle: { type: String, default: "Explore categories, priced upfront by verified vendors." },

    // ===== WHY US SECTION (the 4 trust boxes) =====
    whyUsEyebrow: { type: String, default: "Why QuickSeva" },
    whyUsTitle: { type: String, default: "Built for trust, not just convenience" },
    whyUs: {
      type: [whyUsSchema],
      default: [
        { icon: "fa-shield-halved", title: "Verified professionals", desc: "Every partner passes a background check and skill test before their first job." },
        { icon: "fa-indian-rupee-sign", title: "Upfront pricing", desc: "See the exact cost when you book. What you're quoted is what you pay." },
        { icon: "fa-clock", title: "On-time guarantee", desc: "Late arrivals are rare — and when they happen, we make it right." },
        { icon: "fa-headset", title: "Support that answers", desc: "A real person is reachable before, during and after every booking." },
      ],
    },

    // ===== HOW IT WORKS SECTION (the 3 steps) =====
    howItWorksEyebrow: { type: String, default: "Simple by design" },
    howItWorksTitle: { type: String, default: "How it works" },
    howItWorks: {
      type: [howItWorksStepSchema],
      default: [
        { n: "01", icon: "fa-magnifying-glass", title: "Book", desc: "Pick a service, share your location and preferred time slot." },
        { n: "02", icon: "fa-user-check", title: "Vendor assigned", desc: "The nearest verified professional is matched and confirmed to you." },
        { n: "03", icon: "fa-circle-check", title: "Service completed", desc: "Track the job live, pay the quoted price, then rate your experience." },
      ],
    },

    // ===== FEATURED VENDORS SECTION HEADER (vendor cards stay live from /featured-vendors) =====
    vendorsEyebrow: { type: String, default: "Meet the network" },
    vendorsTitle: { type: String, default: "Featured vendors" },

    // ===== REVIEWS SECTION (the 3 testimonial cards) =====
    reviewsEyebrow: { type: String, default: "Real feedback" },
    reviewsTitle: { type: String, default: "What customers say" },
    reviews: {
      type: [reviewSchema],
      default: [
        { name: "Priya Nair", role: "Homeowner, Pune", quote: "Booked an AC service at 9pm and had someone at the door by 10 the next morning. Priced exactly as shown." },
        { name: "Karan Mehta", role: "Tenant, Ahmedabad", quote: "The electrician sent a photo ID before arriving. Small thing, but it made me trust the whole platform instantly." },
        { name: "Divya Shah", role: "Homeowner, Surat", quote: "Washing machine drum issue fixed in one visit. No upsell, no hidden parts cost — just the quote I'd agreed to." },
      ],
    },

    // ===== APP PROMO SECTION (bottom dark banner) =====
    appEyebrow: { type: String, default: "On the go" },
    appTitle: { type: String, default: "Book, track and pay — right from your pocket." },
    appSubtitle: {
      type: String,
      default: "Get the QuickSeva app for live vendor tracking, instant rebooking and exclusive app-only offers.",
    },
    appStoreText: { type: String, default: "App Store" },
    googlePlayText: { type: String, default: "Google Play" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("HomeContent", HomeContentSchema);