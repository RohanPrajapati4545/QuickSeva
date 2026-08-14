const DynamicContent = require("../models/DynamicContentSchema");

/**
 * DEFAULT_CONTENT
 * ----------------
 * Agar DB me kisi page ka document abhi tak nahi bana hai, to yeh
 * default values return hote hain — isse frontend kabhi khali/crash
 * nahi hoga, aur pehli baar admin panel kholte hi purana (current)
 * hardcoded data hi pre-filled dikhega, edit karke seedha update kar sakte ho.
 */
const DEFAULT_CONTENT = {
  home: {
    hero: {
      badge: "Trusted by 50,000+ homes",
      titleLine1: "Every home fix,",
      titleLine2Highlight: "one tap away.",
      subtitle:
        "From a tripped fuse to a full home clean — book verified electricians, plumbers, mechanics and repair experts near you, with the price shown before you confirm.",
    },
    whyUs: [
      { icon: "fa-shield-halved", title: "Verified professionals", desc: "Every partner passes a background check and skill test before their first job." },
      { icon: "fa-indian-rupee-sign", title: "Upfront pricing", desc: "See the exact cost when you book. What you're quoted is what you pay." },
      { icon: "fa-clock", title: "On-time guarantee", desc: "Late arrivals are rare — and when they happen, we make it right." },
      { icon: "fa-headset", title: "Support that answers", desc: "A real person is reachable before, during and after every booking." },
    ],
    howItWorks: [
      { n: "01", icon: "fa-magnifying-glass", title: "Book", desc: "Pick a service, share your location and preferred time slot." },
      { n: "02", icon: "fa-user-check", title: "Vendor assigned", desc: "The nearest verified professional is matched and confirmed to you." },
      { n: "03", icon: "fa-circle-check", title: "Service completed", desc: "Track the job live, pay the quoted price, then rate your experience." },
    ],
    reviews: [
      { name: "Priya Nair", role: "Homeowner, Pune", quote: "Booked an AC service at 9pm and had someone at the door by 10 the next morning." },
      { name: "Karan Mehta", role: "Tenant, Ahmedabad", quote: "The electrician sent a photo ID before arriving. It made me trust the platform instantly." },
      { name: "Divya Shah", role: "Homeowner, Surat", quote: "Washing machine drum issue fixed in one visit. No upsell, no hidden parts cost." },
    ],
    appSection: {
      badge: "On the go",
      title: "Book, track and pay — right from your pocket.",
      desc: "Get the QuickSeva app for live vendor tracking, instant rebooking and exclusive app-only offers.",
    },
  },

  about: {
    hero: {
      badge: "About QuickSeva",
      title: "Home repairs, without the runaround.",
      subtitle:
        "We started QuickSeva because finding a trustworthy electrician or plumber shouldn't take five phone calls and a leap of faith. Today we connect thousands of households with verified professionals every month.",
    },
    values: [
      { icon: "fa-shield-halved", title: "Verified, always", desc: "Every professional is background-checked before they ever get a job." },
      { icon: "fa-indian-rupee-sign", title: "Upfront pricing", desc: "You see the cost before you book — no surprise charges at the door." },
      { icon: "fa-clock", title: "Fast response", desc: "Most bookings are matched with a nearby pro in under 15 minutes." },
    ],
    timeline: [
      { year: "2022", text: "QuickSeva starts in one city with 40 electricians and plumbers." },
      { year: "2023", text: "Carpentry, painting and appliance repair join the platform." },
      { year: "2024", text: "Crosses 10,000 completed jobs across 18 cities." },
      { year: "2026", text: "Building the fastest way to get anything at home fixed." },
    ],
  },

  contact: {
    hero: {
      badge: "A real person answers, every time",
      titleLine1: "Stuck on something?",
      titleLine2Highlight: "Let's sort it out.",
      subtitle:
        "Whether it's a booking issue, a billing question, or you want to join the vendor network — reach us however suits you. Average reply time is under 15 minutes.",
    },
    channels: [
      { icon: "fa-phone-volume", title: "Call us", detail: "+91 74153 77427", sub: "Toll-free, 7am – 11pm every day", action: "tel:18001234567", cta: "Call now" },
      { icon: "fa-envelope", title: "Email us", detail: "help@quickseva.in", sub: "We reply within 2 hours, on average", action: "mailto:help@quickseva.in", cta: "Send an email" },
      { icon: "fa-comment-dots", title: "WhatsApp", detail: "+91 98765 43210", sub: "Fastest for booking changes", action: "https://wa.me/919876543210", cta: "Start a chat" },
      { icon: "fa-building", title: "Visit us", detail: "alphawizz technologies pvt. ltd", sub: "Vijay Nagar, Indore, Madhya Pradesh 452010", action: "https://maps.google.com", cta: "Get directions" },
    ],
    reasons: [
      { value: "booking", label: "Help with a booking" },
      { value: "vendor", label: "Become a vendor partner" },
      { value: "billing", label: "Billing or a refund" },
      { value: "feedback", label: "Feedback or a complaint" },
      { value: "other", label: "Something else" },
    ],
    faqs: [
      { q: "How quickly can a vendor reach me?", a: "Most bookings are matched to a verified professional within 15 minutes, and same-day slots are available for every service on the platform." },
      { q: "Is the price I see really the price I pay?", a: "Yes. The quote shown at booking is the final amount for the job described." },
      { q: "What happens if I'm not happy with the work?", a: "Tell us within 48 hours. We'll send someone to make it right or refund the service fee — whichever you prefer." },
      { q: "How do I get listed as a vendor?", a: "Choose 'Become a vendor partner' in the form below. Onboarding is usually completed within a week." },
    ],
    supportHours: {
      monSat: "7:00 am – 11:00 pm",
      sunday: "9:00 am – 9:00 pm",
      emergency: "24 / 7",
    },
    officeInfo: {
      title: "Head office",
      addressLine1: "Plot Number 152, Ratanlok Colony, Scheme No 53, near Cars 24 showroom",
      addressLine2: "Vijay Nagar, Indore, Madhya Pradesh 452010",
    },
  },

  header: {
    navLinks: [
      { label: "Home", path: "/" },
      { label: "Services", path: "/services", dropdown: true },
      { label: "About", path: "/about" },
      { label: "Contact", path: "/contact" },
    ],
    serviceLinks: [
      { icon: "fa-bolt", label: "Electrician", path: "/services/electrician" },
      { icon: "fa-faucet-drip", label: "Plumber", path: "/services/plumber" },
      { icon: "fa-laptop", label: "Laptop Repair", path: "/services/laptop-repair" },
      { icon: "fa-desktop", label: "Computer Repair", path: "/services/computer-repair" },
      { icon: "fa-snowflake", label: "AC Repair", path: "/services/ac-repair" },
      { icon: "fa-jug-detergent", label: "Washing Machine Repair", path: "/services/washing-machine-repair" },
      { icon: "fa-temperature-low", label: "Refrigerator Repair", path: "/services/refrigerator-repair" },
      { icon: "fa-microchip", label: "Electronics Repair", path: "/services/electronics-repair" },
      { icon: "fa-car", label: "Car Mechanic", path: "/services/car-mechanic" },
      { icon: "fa-broom", label: "Home Cleaning", path: "/services/home-cleaning" },
      { icon: "fa-paint-roller", label: "Painting", path: "/services/painting" },
      { icon: "fa-hammer", label: "Carpenter", path: "/services/carpenter" },
    ],
  },
};

const ALLOWED_PAGES = Object.keys(DEFAULT_CONTENT); // ["home","about","contact","header"]

/**
 * GET /api/dynamic/:page
 * Public — koi bhi frontend page yahan se apna content fetch karega.
 * DB me document na ho to default content bhej dete hain (never 404).
 */
const getContent = async (req, res) => {
  try {
    const { page } = req.params;
    if (!ALLOWED_PAGES.includes(page)) {
      return res.status(400).json({ success: false, message: `Invalid page. Allowed: ${ALLOWED_PAGES.join(", ")}` });
    }

    const doc = await DynamicContent.findOne({ page });
    const content = doc ? { ...DEFAULT_CONTENT[page], ...doc.content } : DEFAULT_CONTENT[page];

    return res.status(200).json({ success: true, page, content });
  } catch (error) {
    console.error("getContent error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch content" });
  }
};

/**
 * GET /api/dynamic
 * Admin only — sabhi pages ka content ek saath (admin dashboard listing ke liye).
 */
const getAllContent = async (req, res) => {
  try {
    const docs = await DynamicContent.find({});
    const map = {};
    ALLOWED_PAGES.forEach((page) => {
      const found = docs.find((d) => d.page === page);
      map[page] = found ? { ...DEFAULT_CONTENT[page], ...found.content } : DEFAULT_CONTENT[page];
    });
    return res.status(200).json({ success: true, pages: map });
  } catch (error) {
    console.error("getAllContent error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch content" });
  }
};

/**
 * PUT /api/dynamic/:page
 * Admin only — poora ya partial content update (upsert).
 * Body: { content: {...} }  -> jo bhi keys bheji jaayengi wahi merge/overwrite hongi.
 */
const updateContent = async (req, res) => {
  try {
    const { page } = req.params;
    const { content } = req.body;

    if (!ALLOWED_PAGES.includes(page)) {
      return res.status(400).json({ success: false, message: `Invalid page. Allowed: ${ALLOWED_PAGES.join(", ")}` });
    }
    if (!content || typeof content !== "object" || Array.isArray(content)) {
      return res.status(400).json({ success: false, message: "`content` object is required in request body" });
    }

    const existing = await DynamicContent.findOne({ page });
    const mergedContent = existing ? { ...existing.content, ...content } : { ...DEFAULT_CONTENT[page], ...content };

    const updated = await DynamicContent.findOneAndUpdate(
      { page },
      { content: mergedContent, updatedBy: req.admin?._id || req.user?._id || undefined },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    return res.status(200).json({ success: true, message: "Content updated successfully", page, content: updated.content });
  } catch (error) {
    console.error("updateContent error:", error);
    return res.status(500).json({ success: false, message: "Failed to update content" });
  }
};

/**
 * DELETE /api/dynamic/:page
 * Admin only — page ka content reset karke default par le aata hai
 * (document delete kar deta hai, agli GET call par defaults return honge).
 */
const resetContent = async (req, res) => {
  try {
    const { page } = req.params;
    if (!ALLOWED_PAGES.includes(page)) {
      return res.status(400).json({ success: false, message: `Invalid page. Allowed: ${ALLOWED_PAGES.join(", ")}` });
    }
    await DynamicContent.findOneAndDelete({ page });
    return res.status(200).json({ success: true, message: "Content reset to default", page, content: DEFAULT_CONTENT[page] });
  } catch (error) {
    console.error("resetContent error:", error);
    return res.status(500).json({ success: false, message: "Failed to reset content" });
  }
};

module.exports = { getContent, getAllContent, updateContent, resetContent, DEFAULT_CONTENT, ALLOWED_PAGES };