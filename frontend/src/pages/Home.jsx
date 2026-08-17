import React, { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const USER_API = `${process.env.REACT_APP_API_URL}/api/user`;
const BASE_URL = process.env.REACT_APP_API_URL;

// Admin-editable home content — these are just the render defaults so the
// page still looks right the instant it mounts, before the fetch resolves.
// Keep this in sync with the schema defaults in HomeContentSchema.js.
const DEFAULT_CONTENT = {
  heroBadgeText: "Trusted by 50,000+ homes",
  heroTitleLine1: "Every home fix,",
  heroTitleLine2: "one tap away.",
  heroSubtitle:
    "From a tripped fuse to a full home clean — book verified electricians, plumbers, mechanics and repair experts near you, with the price shown before you confirm.",
  heroSearchPlaceholder: "What do you need fixed?",
  heroSearchButtonText: "Search",
  heroCtaPrimaryText: "Book a Service",
  heroCtaGhostText: "Become a Vendor",

  servicesEyebrow: "What we offer",
  servicesTitle: "Popular services",
  servicesSubtitle: "Explore categories, priced upfront by verified vendors.",

  whyUsEyebrow: "Why QuickSeva",
  whyUsTitle: "Built for trust, not just convenience",
  whyUs: [
    { icon: "fa-shield-halved", title: "Verified professionals", desc: "Every partner passes a background check and skill test before their first job." },
    { icon: "fa-indian-rupee-sign", title: "Upfront pricing", desc: "See the exact cost when you book. What you're quoted is what you pay." },
    { icon: "fa-clock", title: "On-time guarantee", desc: "Late arrivals are rare — and when they happen, we make it right." },
    { icon: "fa-headset", title: "Support that answers", desc: "A real person is reachable before, during and after every booking." },
  ],

  howItWorksEyebrow: "Simple by design",
  howItWorksTitle: "How it works",
  howItWorks: [
    { n: "01", icon: "fa-magnifying-glass", title: "Book", desc: "Pick a service, share your location and preferred time slot." },
    { n: "02", icon: "fa-user-check", title: "Vendor assigned", desc: "The nearest verified professional is matched and confirmed to you." },
    { n: "03", icon: "fa-circle-check", title: "Service completed", desc: "Track the job live, pay the quoted price, then rate your experience." },
  ],

  vendorsEyebrow: "Meet the network",
  vendorsTitle: "Featured vendors",

  reviewsEyebrow: "Real feedback",
  reviewsTitle: "What customers say",
  reviews: [
    { name: "Priya Nair", role: "Homeowner, Pune", quote: "Booked an AC service at 9pm and had someone at the door by 10 the next morning. Priced exactly as shown." },
    { name: "Karan Mehta", role: "Tenant, Ahmedabad", quote: "The electrician sent a photo ID before arriving. Small thing, but it made me trust the whole platform instantly." },
    { name: "Divya Shah", role: "Homeowner, Surat", quote: "Washing machine drum issue fixed in one visit. No upsell, no hidden parts cost — just the quote I'd agreed to." },
  ],

  appEyebrow: "On the go",
  appTitle: "Book, track and pay — right from your pocket.",
  appSubtitle: "Get the QuickSeva app for live vendor tracking, instant rebooking and exclusive app-only offers.",
  appStoreText: "App Store",
  googlePlayText: "Google Play",
};

const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (/^https?:\/\//i.test(imagePath)) return imagePath;
  const cleanBase = BASE_URL?.replace(/\/$/, "") || "";
  const cleanPath = imagePath.replace(/^\//, "");
  return `${cleanBase}/${cleanPath}`;
};

function useDebouncedValue(value, delay = 400) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}

function Reveal({ children, delay = 0, className = "" }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={`hs-reveal ${visible ? "hs-reveal-visible" : ""} ${className}`} style={{ transitionDelay: `${delay}s` }}>
      {children}
    </div>
  );
}

function ServiceOrbit() {
  const badges = [
    { icon: "fa-bolt", angle: -90, r: "#F97316" },
    { icon: "fa-faucet-drip", angle: -18, r: "#1F2937" },
    { icon: "fa-laptop", angle: 54, r: "#F97316" },
    { icon: "fa-car", angle: 126, r: "#1F2937" },
    { icon: "fa-broom", angle: 198, r: "#F97316" },
  ];
  const cx = 260, cy = 260, R = 190;

  return (
    <div className="hs-orbit-wrap relative mx-auto aspect-square w-full max-w-[440px]">
      <svg viewBox="0 0 520 520" className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="hsGlow" cx="50%" cy="45%" r="60%">
            <stop offset="0%" stopColor="#FED7AA" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#FED7AA" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="hsHub" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#374151" />
            <stop offset="100%" stopColor="#1F2937" />
          </linearGradient>
        </defs>

        <circle cx={cx} cy={cy} r="230" fill="url(#hsGlow)" />
        <circle className="hs-orbit-ring" cx={cx} cy={cy} r={R} fill="none" stroke="#F97316" strokeOpacity="0.35" strokeWidth="2" strokeDasharray="2 10" strokeLinecap="round" />

        <g className="hs-orbit-hub" style={{ transformOrigin: `${cx}px ${cy}px` }}>
          <rect x={cx - 70} y={cy - 70} width="140" height="140" rx="32" fill="url(#hsHub)" />
          <path d={`M ${cx - 34} ${cy + 8} v -20 l 34 -26 l 34 26 v 20`} fill="none" stroke="#F97316" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
          <rect x={cx - 14} y={cy - 2} width="28" height="34" rx="4" fill="#F97316" />
        </g>

        {badges.map((b, i) => {
          const rad = (b.angle * Math.PI) / 180;
          const x = cx + R * Math.cos(rad);
          const y = cy + R * Math.sin(rad);
          const bg = b.r === "#F97316" ? "#F97316" : "#1F2937";
          return (
            <g key={b.icon} className="hs-orbit-badge" style={{ animationDelay: `${i * 0.35}s` }}>
              <circle cx={x} cy={y} r="38" fill="#FFFFFF" className="hs-orbit-shadow" />
              <circle cx={x} cy={y} r="32" fill={bg} />
              <foreignObject x={x - 16} y={y - 16} width="32" height="32">
                <div className="flex h-8 w-8 items-center justify-center">
                  <i className={`fa-solid ${b.icon} text-sm text-white`}></i>
                </div>
              </foreignObject>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

const Home = () => {
  const navigate = useNavigate();
  const [serviceQuery, setServiceQuery] = useState("");

  // Admin-editable static copy (hero, why-us, how-it-works, reviews, app promo).
  const [content, setContent] = useState(DEFAULT_CONTENT);

  // Live data (categories / featured services / featured vendors).
  const [categories, setCategories] = useState([]);
  const [featuredServices, setFeaturedServices] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [homeLoading, setHomeLoading] = useState(true);

  const debouncedQuery = useDebouncedValue(serviceQuery, 400);
  const [suggestOpen, setSuggestOpen] = useState(false);
  const [suggestLoading, setSuggestLoading] = useState(false);
  const [suggestServices, setSuggestServices] = useState([]);
  const [suggestCategories, setSuggestCategories] = useState([]);
  const searchBoxRef = useRef(null);

  const USER_APIBASE = USER_API;

  // Fetch the admin-editable content once on mount. Falls back silently
  // to DEFAULT_CONTENT if the request fails, so the page still renders.
  useEffect(() => {
    const fetchContent = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/content/home`);
        if (res.data?.content) {
          setContent(res.data.content);
        }
      } catch (error) {
        console.log("Failed to load home content, using defaults:", error);
      }
    };

    fetchContent();
  }, []);

  useEffect(() => {
    const fetchHomeData = async () => {
      setHomeLoading(true);
      try {
        const [catRes, servRes, vendRes] = await Promise.all([
          axios.get(`${USER_APIBASE}/categories`),
          axios.get(`${USER_APIBASE}/services`, { params: { limit: 8 } }),
          axios.get(`${USER_APIBASE}/featured-vendors`, { params: { limit: 4 } }),
        ]);
        setCategories(catRes.data.categories || []);
        setFeaturedServices(servRes.data.services || []);
        setVendors(vendRes.data.vendors || []);
      } catch (error) {
        console.log(error);
      } finally {
        setHomeLoading(false);
      }
    };
    fetchHomeData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const term = debouncedQuery.trim();

    if (!term) {
      setSuggestServices([]);
      setSuggestCategories([]);
      setSuggestOpen(false);
      return;
    }

    const matchedCategories = categories.filter((c) =>
      c.category_name.toLowerCase().includes(term.toLowerCase())
    );
    setSuggestCategories(matchedCategories.slice(0, 4));

    let cancelled = false;
    const fetchSuggestions = async () => {
      setSuggestLoading(true);
      try {
        const res = await axios.get(`${USER_APIBASE}/services`, {
          params: { q: term, limit: 5 },
        });
        if (!cancelled) setSuggestServices(res.data.services || []);
      } catch (error) {
        if (!cancelled) setSuggestServices([]);
      } finally {
        if (!cancelled) setSuggestLoading(false);
      }
    };
    fetchSuggestions();
    setSuggestOpen(true);

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuery]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchBoxRef.current && !searchBoxRef.current.contains(e.target)) {
        setSuggestOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const goTo = useCallback(
    (path) => {
      navigate(path);
      window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
    },
    [navigate]
  );

  const handleSearch = (e) => {
    e.preventDefault();
    setSuggestOpen(false);
    const params = new URLSearchParams();
    if (serviceQuery) params.set("q", serviceQuery);
    navigate(`/services?${params.toString()}`);
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  };

  const handleSelectCategory = (slug) => {
    setSuggestOpen(false);
    setServiceQuery("");
    goTo(`/services/${slug}`);
  };

  const handleSelectService = (service) => {
    setSuggestOpen(false);
    setServiceQuery("");
    goTo(`/vendor-details/${service.vendor?._id}`);
  };

  const showDropdown = suggestOpen && serviceQuery.trim().length > 0;

  return (
    <div className="bg-white text-[#1F2937]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=Inter:wght@400;500;600;700&display=swap');

        .hs-display { font-family: 'Sora', system-ui, sans-serif; }
        .hs-body { font-family: 'Inter', system-ui, sans-serif; }

        @keyframes hsFadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        .hs-fade-up { opacity: 0; animation: hsFadeUp 0.7s cubic-bezier(0.16,1,0.3,1) forwards; }

        .hs-reveal { opacity: 0; transform: translateY(26px); transition: opacity 0.7s cubic-bezier(0.16,1,0.3,1), transform 0.7s cubic-bezier(0.16,1,0.3,1); }
        .hs-reveal-visible { opacity: 1; transform: translateY(0); }

        .hs-card { border-radius: 16px; transition: transform 0.3s cubic-bezier(0.16,1,0.3,1), box-shadow 0.3s ease, border-color 0.3s ease; }
        .hs-card:hover { transform: translateY(-4px); box-shadow: 0 20px 40px -22px rgba(31,41,55,0.18); border-color: #F97316; }
        .hs-icon-tile { transition: background-color 0.3s ease, color 0.3s ease, transform 0.3s ease; }
        .hs-card:hover .hs-icon-tile { background-color: #F97316; color: #FFFFFF; transform: scale(1.05); }

        .hs-cta-primary { background-color: #F97316; transition: background-color 0.25s ease, transform 0.25s ease, box-shadow .25s ease; box-shadow: 0 14px 28px -14px rgba(249,115,22,0.55); }
        .hs-cta-primary:hover { background-color: #EA580C; transform: translateY(-2px); }

        .hs-cta-ghost { transition: background-color 0.25s ease, border-color 0.25s ease, color 0.25s ease; }
        .hs-cta-ghost:hover { background-color: #1F2937; border-color: #1F2937; color: #FFFFFF; }

        .hs-orbit-hub { animation: hsHubFloat 5s ease-in-out infinite; }
        @keyframes hsHubFloat { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
        .hs-orbit-ring { animation: hsRingSpin 60s linear infinite; transform-origin: 260px 260px; }
        @keyframes hsRingSpin { to { transform: rotate(360deg); } }
        .hs-orbit-badge { animation: hsBadgeFloat 4.5s ease-in-out infinite; transform-origin: center; }
        @keyframes hsBadgeFloat { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
        .hs-orbit-shadow { filter: drop-shadow(0 10px 14px rgba(31,41,55,0.18)); }

        .hs-step-line { transform-origin: left; transform: scaleX(0); transition: transform 1s cubic-bezier(0.16,1,0.3,1); }
        .hs-reveal-visible .hs-step-line { transform: scaleX(1); }

        .hs-avatar { background: linear-gradient(135deg, #F97316, #EA580C); }

        @keyframes hsSpin { to { transform: rotate(360deg); } }
        .hs-spin { animation: hsSpin 0.8s linear infinite; }

        @keyframes hsSuggestIn { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }
        .hs-suggest-panel { animation: hsSuggestIn 0.18s ease-out; }
        .hs-suggest-item { transition: background-color 0.15s ease; }
        .hs-suggest-item:hover { background-color: #F8FAFC; }

        @media (prefers-reduced-motion: reduce) {
          .hs-fade-up, .hs-reveal, .hs-card, .hs-orbit-hub, .hs-orbit-ring, .hs-orbit-badge, .hs-step-line, .hs-suggest-panel {
            animation: none !important; transition: none !important; opacity: 1 !important; transform: none !important;
          }
        }
      `}</style>

      <section className="relative overflow-hidden bg-[#F8FAFC] px-4 pb-12 pt-12 sm:px-6 sm:pt-14 lg:pb-16 lg:pt-16">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-9 lg:grid-cols-[60%_40%] lg:gap-5">
          <div className="max-w-2xl">
            <span className="hs-fade-up hs-body inline-flex items-center gap-2 rounded-full border border-[#F97316]/25 bg-[#F97316]/10 px-3.5 py-1.5 text-xs font-semibold text-[#EA580C]" style={{ animationDelay: "0.05s" }}>
              <i className="fa-solid fa-circle-check"></i>
              {content.heroBadgeText}
            </span>

            <h1 className="hs-fade-up hs-display mt-6 text-3xl font-extrabold leading-[1.1] text-[#1F2937] sm:text-4xl lg:text-[2.7rem]" style={{ animationDelay: "0.15s" }}>
              {content.heroTitleLine1}
              <br />
              <span className="text-[#F97316]">{content.heroTitleLine2}</span>
            </h1>

            <p className="hs-fade-up hs-body mt-4 max-w-lg text-sm leading-relaxed text-[#4B5563] sm:text-base" style={{ animationDelay: "0.25s" }}>
              {content.heroSubtitle}
            </p>

            <div ref={searchBoxRef} className="relative">
              <form
                onSubmit={handleSearch}
                className="hs-fade-up hs-card mt-8 flex flex-col gap-2 rounded-2xl border border-[#E5E7EB] bg-white p-3 shadow-[0_20px_45px_-25px_rgba(31,41,55,0.25)] sm:flex-row sm:items-center sm:gap-0 sm:p-2"
                style={{ animationDelay: "0.35s" }}
              >
                <label className="flex flex-1 items-center gap-3 rounded-xl px-3 py-2.5">
                  <i className="fa-solid fa-magnifying-glass text-[#F97316]"></i>
                  <input
                    type="text"
                    value={serviceQuery}
                    onChange={(e) => setServiceQuery(e.target.value)}
                    onFocus={() => serviceQuery.trim() && setSuggestOpen(true)}
                    placeholder={content.heroSearchPlaceholder}
                    className="hs-body w-full bg-transparent text-sm text-[#1F2937] outline-none placeholder:text-[#9CA3AF]"
                    autoComplete="off"
                  />
                </label>
                <button type="submit" className="hs-cta-primary hs-body shrink-0 rounded-xl px-6 py-3 text-sm font-semibold text-white">
                  {content.heroSearchButtonText}
                </button>
              </form>

              {showDropdown && (
                <div className="hs-suggest-panel hs-body absolute left-0 right-0 top-full z-30 mt-2 overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-[0_24px_55px_-24px_rgba(31,41,55,0.3)]">
                  {suggestLoading ? (
                    <div className="flex items-center justify-center gap-2 px-4 py-6 text-sm text-[#6B7280]">
                      <i className="fa-solid fa-circle-notch hs-spin text-[#F97316]"></i>
                      Searching…
                    </div>
                  ) : suggestCategories.length === 0 && suggestServices.length === 0 ? (
                    <div className="px-4 py-6 text-center text-sm text-[#6B7280]">
                      No matches for “{serviceQuery}”
                    </div>
                  ) : (
                    <>
                      {suggestCategories.length > 0 && (
                        <div className="border-b border-[#E5E7EB] py-2">
                          <p className="px-4 pb-1 text-[11px] font-bold uppercase tracking-wide text-[#9CA3AF]">
                            Categories
                          </p>
                          {suggestCategories.map((c) => (
                            <div
                              key={c.slug}
                              onClick={() => handleSelectCategory(c.slug)}
                              className="hs-suggest-item flex cursor-pointer items-center gap-3 px-4 py-2.5 text-sm text-[#1F2937]"
                            >
                              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F8FAFC] text-[#F97316]">
                                <i className={`fa-solid ${c.icon} text-xs`}></i>
                              </span>
                              {c.category_name}
                            </div>
                          ))}
                        </div>
                      )}

                      {suggestServices.length > 0 && (
                        <div className="py-2">
                          <p className="px-4 pb-1 text-[11px] font-bold uppercase tracking-wide text-[#9CA3AF]">
                            Services
                          </p>
                          {suggestServices.map((s) => (
                            <div
                              key={s._id}
                              onClick={() => handleSelectService(s)}
                              className="hs-suggest-item flex cursor-pointer items-center justify-between gap-3 px-4 py-2.5"
                            >
                              <div className="flex min-w-0 items-center gap-3">
                                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#F8FAFC] text-[#F97316]">
                                  <i className={`fa-solid ${s.category?.icon || "fa-tags"} text-xs`}></i>
                                </span>
                                <div className="min-w-0">
                                  <p className="truncate text-sm font-medium text-[#1F2937]">{s.service_name}</p>
                                  <p className="truncate text-xs text-[#6B7280]">
                                    {s.vendor?.shop_name || s.vendor?.name}
                                  </p>
                                </div>
                              </div>
                              <span className="shrink-0 text-xs font-bold text-[#F97316]">₹{s.price}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>

            <div className="hs-fade-up mt-6 flex flex-col items-start gap-3 sm:flex-row sm:items-center" style={{ animationDelay: "0.45s" }}>
              <button onClick={() => goTo("/services")} className="hs-cta-primary hs-body w-full rounded-2xl px-6 py-3 text-sm font-semibold text-white sm:w-auto">
                {content.heroCtaPrimaryText}
              </button>
              <button onClick={() => goTo("/register")} className="hs-cta-ghost hs-body w-full rounded-2xl border border-[#1F2937]/20 px-6 py-3 text-sm font-semibold text-[#1F2937] sm:w-auto">
                {content.heroCtaGhostText}
              </button>
            </div>
          </div>

          <div className="hs-fade-up mx-auto w-full max-w-sm lg:max-w-none" style={{ animationDelay: "0.2s" }}>
            <ServiceOrbit />
          </div>
        </div>
      </section>

      <section className="px-4 py-14 sm:px-6 lg:py-20">
        <div className="mx-auto max-w-7xl">
          <Reveal className="mx-auto max-w-xl text-center">
            <span className="hs-body text-xs font-bold uppercase tracking-[0.2em] text-[#F97316]">{content.servicesEyebrow}</span>
            <h2 className="hs-display mt-2 text-2xl font-extrabold text-[#1F2937] sm:text-3xl">{content.servicesTitle}</h2>
            <p className="hs-body mt-3 text-[#6B7280]">{content.servicesSubtitle}</p>
          </Reveal>

          {homeLoading ? (
            <div className="mt-9 flex items-center justify-center gap-2 py-10 text-sm text-[#6B7280]">
              <i className="fa-solid fa-circle-notch hs-spin text-[#F97316]"></i>
              Loading…
            </div>
          ) : categories.length === 0 ? (
            <p className="mt-9 text-center text-sm text-[#6B7280]">No categories available yet.</p>
          ) : (
            <div className="mt-9 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {categories.slice(0, 8).map((c, i) => (
                <Reveal key={c.slug} delay={(i % 4) * 0.06}>
                  <div onClick={() => goTo(`/services/${c.slug}`)} className="hs-card hs-body h-full cursor-pointer rounded-2xl border border-[#E5E7EB] bg-white p-4 sm:p-5">
                    <div className="hs-icon-tile flex h-10 w-10 items-center justify-center rounded-xl bg-[#F8FAFC] text-[#F97316]">
                      <i className={`fa-solid ${c.icon} text-lg`}></i>
                    </div>
                    <h3 className="hs-display mt-3 text-sm font-bold text-[#1F2937]">{c.category_name}</h3>
                  </div>
                </Reveal>
              ))}
            </div>
          )}

          {!homeLoading && featuredServices.length > 0 && (
            <div className="mt-6 text-center">
              <button onClick={() => goTo("/services")} className="hs-body text-sm font-semibold text-[#F97316] hover:text-[#EA580C]">
                See all services →
              </button>
            </div>
          )}
        </div>
      </section>

      <section className="bg-[#F8FAFC] px-4 py-14 sm:px-6 lg:py-20">
        <div className="mx-auto max-w-7xl">
          <Reveal className="mx-auto max-w-xl text-center">
            <span className="hs-body text-xs font-bold uppercase tracking-[0.2em] text-[#F97316]">{content.whyUsEyebrow}</span>
            <h2 className="hs-display mt-2 text-2xl font-extrabold text-[#1F2937] sm:text-3xl">{content.whyUsTitle}</h2>
          </Reveal>

          <div className="mt-9 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {content.whyUs.map((w, i) => (
              <Reveal key={w.title || i} delay={i * 0.08}>
                <div className="hs-card h-full rounded-2xl bg-white p-5 shadow-[0_16px_36px_-24px_rgba(31,41,55,0.2)]">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F97316]/15 text-[#F97316]">
                    <i className={`fa-solid ${w.icon}`}></i>
                  </div>
                  <h3 className="hs-display mt-3 text-sm font-bold text-[#1F2937]">{w.title}</h3>
                  <p className="hs-body mt-2 text-sm leading-relaxed text-[#6B7280]">{w.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-14 sm:px-6 lg:py-20">
        <div className="mx-auto max-w-6xl">
          <Reveal className="mx-auto max-w-xl text-center">
            <span className="hs-body text-xs font-bold uppercase tracking-[0.2em] text-[#F97316]">{content.howItWorksEyebrow}</span>
            <h2 className="hs-display mt-2 text-2xl font-extrabold text-[#1F2937] sm:text-3xl">{content.howItWorksTitle}</h2>
          </Reveal>

          <Reveal delay={0.1} className="relative mt-12 hidden sm:block">
            <div className="hs-step-line absolute left-[14%] right-[14%] top-8 h-0.5 rounded-full bg-[#F97316]/30" />
          </Reveal>

          <div className="mt-10 grid grid-cols-1 gap-10 sm:mt-[-2.5rem] sm:grid-cols-3">
            {content.howItWorks.map((step, i) => (
              <Reveal key={step.n || i} delay={i * 0.15} className="text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-[0_16px_36px_-20px_rgba(31,41,55,0.3)]">
                  <i className={`fa-solid ${step.icon} text-xl text-[#F97316]`}></i>
                </div>
                <div className="hs-body mt-4 text-xs font-bold uppercase tracking-widest text-[#9CA3AF]">Step {step.n}</div>
                <h3 className="hs-display mt-1 text-lg font-bold text-[#1F2937]">{step.title}</h3>
                <p className="hs-body mx-auto mt-2 max-w-xs text-sm text-[#6B7280]">{step.desc}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#F8FAFC] px-4 py-14 sm:px-6 lg:py-20">
        <div className="mx-auto max-w-7xl">
          <Reveal className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <span className="hs-body text-xs font-bold uppercase tracking-[0.2em] text-[#F97316]">{content.vendorsEyebrow}</span>
              <h2 className="hs-display mt-2 text-2xl font-extrabold text-[#1F2937] sm:text-3xl">{content.vendorsTitle}</h2>
            </div>
            <button onClick={() => goTo("/services")} className="hs-body text-sm font-semibold text-[#F97316] hover:text-[#EA580C]">
              See all professionals →
            </button>
          </Reveal>

          {homeLoading ? (
            <div className="mt-9 flex items-center justify-center gap-2 py-10 text-sm text-[#6B7280]">
              <i className="fa-solid fa-circle-notch hs-spin text-[#F97316]"></i>
              Loading…
            </div>
          ) : vendors.length === 0 ? (
            <p className="mt-9 text-center text-sm text-[#6B7280]">No vendors yet.</p>
          ) : (
            <div className="mt-9 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {vendors.map((v, i) => {
                const avatarUrl = getImageUrl(v.image);
                const initials = (v.shop_name || v.name || "V").split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
                return (
                  <Reveal key={v._id} delay={i * 0.08}>
                    <div onClick={() => goTo(`/vendor-details/${v._id}`)} className="hs-card h-full cursor-pointer rounded-2xl border border-[#E5E7EB] bg-white p-5 text-center">
                      {avatarUrl ? (
                        <img src={avatarUrl} alt="" className="mx-auto h-14 w-14 rounded-full object-cover" />
                      ) : (
                        <div className="hs-avatar hs-display mx-auto flex h-14 w-14 items-center justify-center rounded-full text-base font-bold text-white">
                          {initials}
                        </div>
                      )}
                      <h3 className="hs-display mt-3 text-sm font-bold text-[#1F2937]">{v.shop_name || v.name}</h3>
                      <p className="hs-body mt-1 text-xs font-medium uppercase tracking-wide text-[#F97316]">{v.serviceCount} services</p>
                    </div>
                  </Reveal>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <section className="px-4 py-14 sm:px-6 lg:py-20">
        <div className="mx-auto max-w-7xl">
          <Reveal className="mx-auto max-w-xl text-center">
            <span className="hs-body text-xs font-bold uppercase tracking-[0.2em] text-[#F97316]">{content.reviewsEyebrow}</span>
            <h2 className="hs-display mt-2 text-2xl font-extrabold text-[#1F2937] sm:text-3xl">{content.reviewsTitle}</h2>
          </Reveal>

          <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-3">
            {content.reviews.map((r, i) => (
              <Reveal key={r.name || i} delay={i * 0.1}>
                <div className="hs-card h-full rounded-2xl border border-[#E5E7EB] bg-white p-5">
                  <div className="flex gap-1 text-[#F97316]">
                    {Array.from({ length: 5 }).map((_, idx) => (
                      <i key={idx} className="fa-solid fa-star text-xs"></i>
                    ))}
                  </div>
                  <p className="hs-body mt-4 text-sm leading-relaxed text-[#374151]">“{r.quote}”</p>
                  <div className="hs-display mt-5 text-sm font-bold text-[#1F2937]">{r.name}</div>
                  <div className="hs-body text-xs text-[#6B7280]">{r.role}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 pb-20 sm:px-6 lg:pb-28">
        <Reveal className="mx-auto max-w-7xl overflow-hidden rounded-[28px] bg-[#1F2937] px-6 py-10 sm:px-10 sm:py-12">
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2">
            <div>
              <span className="hs-body text-xs font-bold uppercase tracking-[0.2em] text-[#F97316]">{content.appEyebrow}</span>
              <h2 className="hs-display mt-2 text-2xl font-extrabold text-white sm:text-3xl">{content.appTitle}</h2>
              <p className="hs-body mt-4 max-w-md text-sm text-[#D1D5DB] sm:text-base">{content.appSubtitle}</p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <button className="hs-body flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-[#1F2937] transition-transform hover:-translate-y-0.5">
                  <i className="fa-brands fa-apple text-lg"></i>
                  {content.appStoreText}
                </button>
                <button className="hs-cta-primary hs-body flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold text-white">
                  <i className="fa-brands fa-google-play"></i>
                  {content.googlePlayText}
                </button>
              </div>
            </div>

            <div className="mx-auto flex h-44 w-full max-w-xs items-center justify-center rounded-2xl border border-white/10 bg-white/5 sm:h-52">
              <i className="fa-solid fa-mobile-screen-button text-6xl text-[#F97316]"></i>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
};

export default Home;