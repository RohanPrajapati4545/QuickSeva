import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import useDynamicContent from "../hooks/useDynamicContent";

// --- DEFAULT / FALLBACK CONTENT (same as before — shown until API responds) ---
const DEFAULT_CONTACT_CONTENT = {
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
    { q: "Is the price I see really the price I pay?", a: "Yes. The quote shown at booking is the final amount for the job described. If the scope changes on-site, the vendor will confirm any difference with you before continuing." },
    { q: "What happens if I'm not happy with the work?", a: "Tell us within 48 hours through this page or the app. We'll send someone to make it right or refund the service fee — whichever you prefer." },
    { q: "How do I get listed as a vendor?", a: "Choose 'Become a vendor partner' in the form below. Our onboarding team runs a background check and a short skills interview, usually completed within a week." },
  ],
  supportHours: { monSat: "7:00 am – 11:00 pm", sunday: "9:00 am – 9:00 pm", emergency: "24 / 7" },
  officeInfo: {
    title: "Head office",
    addressLine1: "Plot Number 152, Ratanlok Colony, Scheme No 53, near Cars 24 showroom",
    addressLine2: "Vijay Nagar, Indore, Madhya Pradesh 452010",
  },
};

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
    <div
      ref={ref}
      className={`hs-reveal ${visible ? "hs-reveal-visible" : ""} ${className}`}
      style={{ transitionDelay: `${delay}s` }}
    >
      {children}
    </div>
  );
}

function PulseConnect() {
  return (
    <div className="hs-orbit-wrap relative mx-auto w-full max-w-[440px]">
      <svg viewBox="0 0 520 320" className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="pcGlow" cx="50%" cy="50%" r="65%">
            <stop offset="0%" stopColor="#FED7AA" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#FED7AA" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="pcHub" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#374151" />
            <stop offset="100%" stopColor="#1F2937" />
          </linearGradient>
        </defs>

        <circle cx="260" cy="160" r="200" fill="url(#pcGlow)" />

        <path
          id="pcPath"
          d="M 110 160 C 190 60, 330 260, 410 160"
          fill="none"
          stroke="#F97316"
          strokeOpacity="0.35"
          strokeWidth="2.5"
          strokeDasharray="2 10"
          strokeLinecap="round"
        />

        <g>
          <circle cx="110" cy="160" r="46" fill="#FFFFFF" className="hs-orbit-shadow" />
          <circle cx="110" cy="160" r="40" fill="#F97316" />
          <foreignObject x="86" y="136" width="48" height="48">
            <div className="flex h-12 w-12 items-center justify-center">
              <i className="fa-solid fa-user text-lg text-white"></i>
            </div>
          </foreignObject>
        </g>

        <g className="hs-orbit-hub" style={{ transformOrigin: "410px 160px" }}>
          <circle cx="410" cy="160" r="52" fill="#FFFFFF" className="hs-orbit-shadow" />
          <circle cx="410" cy="160" r="46" fill="url(#pcHub)" />
          <foreignObject x="382" y="132" width="56" height="56">
            <div className="flex h-14 w-14 items-center justify-center">
              <i className="fa-solid fa-headset text-xl text-[#F97316]"></i>
            </div>
          </foreignObject>
        </g>

        <circle r="6" fill="#F97316">
          <animateMotion dur="3.4s" repeatCount="indefinite" rotate="auto">
            <mpath href="#pcPath" />
          </animateMotion>
        </circle>

        <circle r="5" fill="#1F2937">
          <animateMotion
            dur="3.4s"
            begin="1.7s"
            repeatCount="indefinite"
            keyPoints="1;0"
            keyTimes="0;1"
          >
            <mpath href="#pcPath" />
          </animateMotion>
        </circle>
      </svg>

      <div className="hs-pulse-tag hs-body absolute left-1/2 top-2 -translate-x-1/2 rounded-full border border-[#F97316]/25 bg-white px-3 py-1 text-[11px] font-semibold text-[#EA580C] shadow-sm">
        avg. reply time: 8 min
      </div>
    </div>
  );
}

function FaqItem({ item, isOpen, onToggle, delay }) {
  return (
    <Reveal delay={delay}>
      <div
        className={`hs-card hs-body overflow-hidden rounded-2xl border bg-white transition-colors ${
          isOpen ? "border-[#F97316]" : "border-[#E5E7EB]"
        }`}
      >
        <button
          onClick={onToggle}
          className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
          aria-expanded={isOpen}
        >
          <span className="hs-display text-sm font-bold text-[#1F2937] sm:text-base">
            {item.q}
          </span>
          <span
            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#F8FAFC] text-[#F97316] transition-transform duration-300 ${
              isOpen ? "rotate-45" : ""
            }`}
          >
            <i className="fa-solid fa-plus text-xs"></i>
          </span>
        </button>
        <div
          className="hs-faq-panel grid transition-[grid-template-rows] duration-300 ease-out"
          style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
        >
          <div className="overflow-hidden">
            <p className="px-5 pb-5 text-sm leading-relaxed text-[#6B7280]">{item.a}</p>
          </div>
        </div>
      </div>
    </Reveal>
  );
}

const Contact = () => {
  const navigate = useNavigate();

  const { content } = useDynamicContent("contact", DEFAULT_CONTACT_CONTENT);
  const { hero, channels, reasons, faqs, supportHours, officeInfo } = content;

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    reason: reasons[0]?.value || "booking",
    message: "",
  });
  const [status, setStatus] = useState("idle"); // idle | sending | sent
  const [openFaq, setOpenFaq] = useState(0);

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;
    setStatus("sending");
    setTimeout(() => setStatus("sent"), 1100);
  };

  return (
    <div className="bg-white text-[#1F2937]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=Inter:wght@400;500;600;700&display=swap');

        .hs-display { font-family: 'Sora', system-ui, sans-serif; }
        .hs-body { font-family: 'Inter', system-ui, sans-serif; }

        @keyframes hsFadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .hs-fade-up { opacity: 0; animation: hsFadeUp 0.7s cubic-bezier(0.16,1,0.3,1) forwards; }

        .hs-reveal {
          opacity: 0;
          transform: translateY(26px);
          transition: opacity 0.7s cubic-bezier(0.16,1,0.3,1),
                      transform 0.7s cubic-bezier(0.16,1,0.3,1);
        }
        .hs-reveal-visible { opacity: 1; transform: translateY(0); }

        .hs-card {
          border-radius: 16px;
          transition: transform 0.3s cubic-bezier(0.16,1,0.3,1),
                      box-shadow 0.3s ease, border-color 0.3s ease;
        }
        .hs-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 40px -22px rgba(31,41,55,0.18);
        }
        .hs-icon-tile {
          transition: background-color 0.3s ease, color 0.3s ease, transform 0.3s ease;
        }
        .hs-channel:hover .hs-icon-tile {
          background-color: #F97316;
          color: #FFFFFF;
          transform: scale(1.05);
        }

        .hs-cta-primary {
          background-color: #F97316;
          transition: background-color 0.25s ease, transform 0.25s ease, box-shadow .25s ease;
          box-shadow: 0 14px 28px -14px rgba(249,115,22,0.55);
        }
        .hs-cta-primary:hover { background-color: #EA580C; transform: translateY(-2px); }
        .hs-cta-primary:disabled { opacity: 0.7; transform: none; cursor: default; }

        .hs-cta-ghost {
          transition: background-color 0.25s ease, border-color 0.25s ease, color 0.25s ease;
        }
        .hs-cta-ghost:hover {
          background-color: #1F2937;
          border-color: #1F2937;
          color: #FFFFFF;
        }

        .hs-input {
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }
        .hs-input:focus {
          border-color: #F97316;
          box-shadow: 0 0 0 4px rgba(249,115,22,0.12);
          outline: none;
        }

        .hs-orbit-hub { animation: hsHubFloat 5s ease-in-out infinite; }
        @keyframes hsHubFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        .hs-orbit-shadow { filter: drop-shadow(0 10px 14px rgba(31,41,55,0.18)); }
        .hs-pulse-tag { animation: hsTagFloat 4.5s ease-in-out infinite; }
        @keyframes hsTagFloat {
          0%, 100% { transform: translate(-50%, 0); }
          50% { transform: translate(-50%, -5px); }
        }

        @keyframes hsCheckPop {
          0% { transform: scale(0); opacity: 0; }
          60% { transform: scale(1.15); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        .hs-check-pop { animation: hsCheckPop 0.5s cubic-bezier(0.16,1,0.3,1) forwards; }

        @keyframes hsSpin { to { transform: rotate(360deg); } }
        .hs-spin { animation: hsSpin 0.8s linear infinite; }

        @media (prefers-reduced-motion: reduce) {
          .hs-fade-up, .hs-reveal, .hs-card, .hs-orbit-hub, .hs-pulse-tag, .hs-check-pop, .hs-spin {
            animation: none !important;
            transition: none !important;
            opacity: 1 !important;
            transform: none !important;
          }
        }
      `}</style>

      {/* ============ HERO ============ */}
      <section className="relative overflow-hidden bg-[#F8FAFC] px-4 pb-12 pt-12 sm:px-6 sm:pt-14 lg:pb-16 lg:pt-16">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-9 lg:grid-cols-[55%_45%] lg:gap-5">
          <div className="max-w-2xl">
            <span
              className="hs-fade-up hs-body inline-flex items-center gap-2 rounded-full border border-[#F97316]/25 bg-[#F97316]/10 px-3.5 py-1.5 text-xs font-semibold text-[#EA580C]"
              style={{ animationDelay: "0.05s" }}
            >
              <i className="fa-solid fa-headset"></i>
              {hero.badge}
            </span>

            <h1
              className="hs-fade-up hs-display mt-6 text-3xl font-extrabold leading-[1.1] text-[#1F2937] sm:text-4xl lg:text-[2.7rem]"
              style={{ animationDelay: "0.15s" }}
            >
              {hero.titleLine1}
              <br />
              <span className="text-[#F97316]">{hero.titleLine2Highlight}</span>
            </h1>

            <p
              className="hs-fade-up hs-body mt-4 max-w-lg text-sm leading-relaxed text-[#4B5563] sm:text-base"
              style={{ animationDelay: "0.25s" }}
            >
              {hero.subtitle}
            </p>

            <div
              className="hs-fade-up mt-8 flex flex-col items-start gap-3 sm:flex-row sm:items-center"
              style={{ animationDelay: "0.35s" }}
            >
              <a
                href="tel:18001234567"
                className="hs-cta-primary hs-body flex w-full items-center justify-center gap-2 rounded-2xl px-6 py-3 text-sm font-semibold text-white sm:w-auto"
              >
                <i className="fa-solid fa-phone"></i>
                Call 1800-123-4567
              </a>
              <button
                onClick={() => navigate("/services")}
                className="hs-cta-ghost hs-body w-full rounded-2xl border border-[#1F2937]/20 px-6 py-3 text-sm font-semibold text-[#1F2937] sm:w-auto"
              >
                Browse services instead
              </button>
            </div>
          </div>

          <div className="hs-fade-up mx-auto w-full max-w-sm lg:max-w-none" style={{ animationDelay: "0.2s" }}>
            <PulseConnect />
          </div>
        </div>
      </section>

      {/* ============ FORM + SIDE INFO ============ */}
      <section className="bg-[#F8FAFC] px-4 py-14 sm:px-6 lg:py-20">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 lg:grid-cols-[1fr_0.7fr]">
          <Reveal>
            <div className="hs-card rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-[0_20px_45px_-25px_rgba(31,41,55,0.15)] sm:p-8">
              <span className="hs-body text-xs font-bold uppercase tracking-[0.2em] text-[#F97316]">
                Send a message
              </span>
              <h2 className="hs-display mt-2 text-2xl font-extrabold text-[#1F2937] sm:text-3xl">
                We'll get back to you shortly
              </h2>

              {status === "sent" ? (
                <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
                  <div className="hs-check-pop flex h-16 w-16 items-center justify-center rounded-full bg-[#F97316]/15 text-[#F97316]">
                    <i className="fa-solid fa-check text-2xl"></i>
                  </div>
                  <h3 className="hs-display text-lg font-bold text-[#1F2937]">
                    Message sent
                  </h3>
                  <p className="hs-body max-w-xs text-sm text-[#6B7280]">
                    Thanks, {form.name.split(" ")[0] || "there"}. Someone from
                    our team will email you at {form.email} shortly.
                  </p>
                  <button
                    onClick={() => {
                      setForm({ name: "", phone: "", email: "", reason: reasons[0]?.value || "booking", message: "" });
                      setStatus("idle");
                    }}
                    className="hs-body mt-2 text-sm font-semibold text-[#F97316] hover:text-[#EA580C]"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="hs-body mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-[#4B5563]">Full name</label>
                    <input
                      required
                      value={form.name}
                      onChange={update("name")}
                      placeholder="Aditi Sharma"
                      className="hs-input rounded-xl border border-[#E5E7EB] px-4 py-2.5 text-sm text-[#1F2937] placeholder:text-[#9CA3AF]"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-[#4B5563]">Phone number</label>
                    <input
                      value={form.phone}
                      onChange={update("phone")}
                      placeholder="98765 43210"
                      className="hs-input rounded-xl border border-[#E5E7EB] px-4 py-2.5 text-sm text-[#1F2937] placeholder:text-[#9CA3AF]"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5 sm:col-span-2">
                    <label className="text-xs font-semibold text-[#4B5563]">Email</label>
                    <input
                      required
                      type="email"
                      value={form.email}
                      onChange={update("email")}
                      placeholder="you@example.com"
                      className="hs-input rounded-xl border border-[#E5E7EB] px-4 py-2.5 text-sm text-[#1F2937] placeholder:text-[#9CA3AF]"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5 sm:col-span-2">
                    <label className="text-xs font-semibold text-[#4B5563]">Reason for contact</label>
                    <select
                      value={form.reason}
                      onChange={update("reason")}
                      className="hs-input rounded-xl border border-[#E5E7EB] bg-white px-4 py-2.5 text-sm text-[#1F2937]"
                    >
                      {reasons.map((r) => (
                        <option key={r.value} value={r.value}>
                          {r.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5 sm:col-span-2">
                    <label className="text-xs font-semibold text-[#4B5563]">Message</label>
                    <textarea
                      required
                      value={form.message}
                      onChange={update("message")}
                      rows={4}
                      placeholder="Tell us what's going on..."
                      className="hs-input resize-none rounded-xl border border-[#E5E7EB] px-4 py-2.5 text-sm text-[#1F2937] placeholder:text-[#9CA3AF]"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={status === "sending"}
                    className="hs-cta-primary hs-body mt-1 flex items-center justify-center gap-2 rounded-2xl px-6 py-3 text-sm font-semibold text-white sm:col-span-2 sm:w-fit"
                  >
                    {status === "sending" ? (
                      <>
                        <i className="fa-solid fa-circle-notch hs-spin"></i>
                        Sending...
                      </>
                    ) : (
                      <>
                        Send message
                        <i className="fa-solid fa-paper-plane text-xs"></i>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </Reveal>

          <div className="flex flex-col gap-4">
            <Reveal delay={0.1}>
              <div className="hs-card rounded-2xl bg-[#1F2937] p-6 text-white">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F97316]/20 text-[#F97316]">
                  <i className="fa-solid fa-clock"></i>
                </div>
                <h3 className="hs-display mt-3 text-sm font-bold">Support hours</h3>
                <div className="hs-body mt-4 space-y-2 text-sm text-[#D1D5DB]">
                  <div className="flex justify-between">
                    <span>Mon – Sat</span>
                    <span className="font-semibold text-white">{supportHours.monSat}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sunday</span>
                    <span className="font-semibold text-white">{supportHours.sunday}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Emergency line</span>
                    <span className="font-semibold text-[#F97316]">{supportHours.emergency}</span>
                  </div>
                </div>
              </div>
            </Reveal>

            <Reveal delay={0.18}>
              <div className="hs-card rounded-2xl border border-[#E5E7EB] bg-white p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F97316]/15 text-[#F97316]">
                  <i className="fa-solid fa-location-dot"></i>
                </div>
                <h3 className="hs-display mt-3 text-sm font-bold text-[#1F2937]">
                  {officeInfo.title}
                </h3>
                <p className="hs-body mt-2 text-sm leading-relaxed text-[#6B7280]">
                  {officeInfo.addressLine1}
                  <br />
                  {officeInfo.addressLine2}
                </p>
              </div>
            </Reveal>

            <Reveal delay={0.26}>
              <div className="hs-card rounded-2xl border border-[#E5E7EB] bg-white p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F97316]/15 text-[#F97316]">
                  <i className="fa-solid fa-users"></i>
                </div>
                <h3 className="hs-display mt-3 text-sm font-bold text-[#1F2937]">
                  Want to join as a vendor?
                </h3>
                <p className="hs-body mt-2 text-sm leading-relaxed text-[#6B7280]">
                  Pick "Become a vendor partner" above, or start the
                  application directly.
                </p>
                <button
                  onClick={() => navigate("/register")}
                  className="hs-body mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[#F97316] hover:text-[#EA580C]"
                >
                  Start application <i className="fa-solid fa-arrow-right text-[10px]"></i>
                </button>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ============ CONTACT CHANNELS ============ */}
      <section className="px-4 py-14 sm:px-6 lg:py-20">
        <div className="mx-auto max-w-7xl">
          <Reveal className="mx-auto max-w-xl text-center">
            <span className="hs-body text-xs font-bold uppercase tracking-[0.2em] text-[#F97316]">
              Pick your channel
            </span>
            <h2 className="hs-display mt-2 text-2xl font-extrabold text-[#1F2937] sm:text-3xl">
              Four ways to reach us
            </h2>
          </Reveal>

          <div className="mt-9 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {channels.map((c, i) => (
              <Reveal key={c.title} delay={i * 0.08}>
                <a
                  href={c.action}
                  target={c.action.startsWith("http") ? "_blank" : undefined}
                  rel="noreferrer"
                  className="hs-card hs-channel hs-body flex h-full flex-col rounded-2xl border border-[#E5E7EB] bg-white p-5"
                >
                  <div className="hs-icon-tile flex h-10 w-10 items-center justify-center rounded-xl bg-[#F8FAFC] text-[#F97316]">
                    <i className={`fa-solid ${c.icon} text-lg`}></i>
                  </div>
                  <h3 className="hs-display mt-3 text-sm font-bold text-[#1F2937]">
                    {c.title}
                  </h3>
                  <p className="hs-display mt-2 text-sm font-bold text-[#F97316]">
                    {c.detail}
                  </p>
                  <p className="mt-1 text-xs text-[#6B7280]">{c.sub}</p>
                  <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-[#1F2937]">
                    {c.cta} <i className="fa-solid fa-arrow-right text-[10px]"></i>
                  </span>
                </a>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============ FAQ ============ */}
      <section className="px-4 py-14 sm:px-6 lg:py-20">
        <div className="mx-auto max-w-3xl">
          <Reveal className="mx-auto max-w-xl text-center">
            <span className="hs-body text-xs font-bold uppercase tracking-[0.2em] text-[#F97316]">
              Before you write in
            </span>
            <h2 className="hs-display mt-2 text-2xl font-extrabold text-[#1F2937] sm:text-3xl">
              Quick answers
            </h2>
          </Reveal>

          <div className="mt-9 flex flex-col gap-3">
            {faqs.map((item, i) => (
              <FaqItem
                key={item.q}
                item={item}
                isOpen={openFaq === i}
                onToggle={() => setOpenFaq(openFaq === i ? -1 : i)}
                delay={i * 0.06}
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;