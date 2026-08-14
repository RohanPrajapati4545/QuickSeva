import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import useDynamicContent from "../hooks/useDynamicContent";

// --- DEFAULT / FALLBACK CONTENT (same as before — shown until API responds) ---
const DEFAULT_ABOUT_CONTENT = {
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
      { threshold: 0.18 }
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

const About = () => {
  const navigate = useNavigate();
  const { content } = useDynamicContent("about", DEFAULT_ABOUT_CONTENT);
  const { hero, values, timeline } = content;

  const goTo = (path) => {
    navigate(path);
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  };

  return (
    <div className="bg-white text-[#1F2937]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=Inter:wght@400;500;600;700&display=swap');
        .hs-display { font-family: 'Sora', system-ui, sans-serif; }
        .hs-body { font-family: 'Inter', system-ui, sans-serif; }

        @keyframes hsFadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .hs-fade-up { opacity: 0; animation: hsFadeUp 0.65s ease-out forwards; }

        .hs-reveal {
          opacity: 0;
          transform: translateY(22px);
          transition: opacity 0.65s cubic-bezier(0.16, 1, 0.3, 1),
                      transform 0.65s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .hs-reveal-visible { opacity: 1; transform: translateY(0); }

        .hs-value-card {
          border-radius: 16px;
          transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1),
                      border-color 0.3s ease, box-shadow 0.3s ease;
        }
        .hs-value-card:hover {
          transform: translateY(-4px);
          border-color: #F97316;
          box-shadow: 0 18px 36px -22px rgba(249, 115, 22, 0.28);
        }

        .hs-timeline-dot { transition: transform 0.3s ease, box-shadow 0.3s ease; }
        .hs-timeline-item:hover .hs-timeline-dot {
          transform: scale(1.3);
          box-shadow: 0 0 0 5px rgba(249, 115, 22, 0.15);
        }

        .hs-timeline-line {
          transform-origin: top;
          transform: scaleY(0);
          transition: transform 1s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .hs-reveal-visible .hs-timeline-line { transform: scaleY(1); }

        .hs-cta-primary {
          background-color: #F97316;
          transition: background-color 0.25s ease, transform 0.2s ease;
        }
        .hs-cta-primary:hover { background-color: #EA580C; transform: translateY(-1px); }

        @media (prefers-reduced-motion: reduce) {
          .hs-fade-up, .hs-reveal, .hs-timeline-line {
            animation: none !important;
            transition: none !important;
            opacity: 1 !important;
            transform: none !important;
          }
        }
      `}</style>

      {/* ============ HERO ============ */}
      <section className="relative overflow-hidden bg-[#F8FAFC] px-4 py-16 text-center sm:px-6">
        <div className="pointer-events-none absolute -top-24 left-1/2 h-64 w-[30rem] -translate-x-1/2 rounded-full bg-[#F97316]/10 blur-3xl" />
        <div className="relative mx-auto max-w-2xl">
          <span
            className="hs-fade-up hs-body inline-flex items-center gap-2 rounded-full border border-[#F97316]/25 bg-[#F97316]/10 px-3 py-1 text-xs font-semibold text-[#EA580C]"
            style={{ animationDelay: "0.05s" }}
          >
            {hero.badge}
          </span>
          <h1
            className="hs-fade-up hs-display mt-5 text-3xl font-extrabold leading-[1.15] text-[#1F2937] sm:text-4xl"
            style={{ animationDelay: "0.15s" }}
          >
            {hero.title}
          </h1>
          <p
            className="hs-fade-up hs-body mx-auto mt-4 max-w-xl text-sm text-[#6B7280] sm:text-base"
            style={{ animationDelay: "0.25s" }}
          >
            {hero.subtitle}
          </p>
        </div>
      </section>

      {/* ============ VALUES ============ */}
      <section className="px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <Reveal>
            <h2 className="hs-display text-center text-2xl font-extrabold text-[#1F2937] sm:text-3xl">
              What we hold ourselves to.
            </h2>
          </Reveal>
          <div className="mt-9 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {values.map((v, i) => (
              <Reveal key={v.title} delay={i * 0.1}>
                <div className="hs-value-card h-full border border-[#E5E7EB] bg-white p-5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F97316]/10 text-[#F97316]">
                    <i className={`fa-solid ${v.icon} text-base`}></i>
                  </div>
                  <h3 className="hs-display mt-3 text-base font-bold text-[#1F2937]">
                    {v.title}
                  </h3>
                  <p className="hs-body mt-2 text-sm text-[#6B7280]">{v.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============ TIMELINE ============ */}
      <section className="border-y border-[#E5E7EB] bg-[#F8FAFC] px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-3xl">
          <Reveal>
            <h2 className="hs-display text-center text-2xl font-extrabold text-[#1F2937] sm:text-3xl">
              Our journey so far.
            </h2>
          </Reveal>

          <Reveal delay={0.1} className="relative mt-9">
            <div className="hs-timeline-line absolute left-0 top-0 h-full w-px bg-[#F97316]/25" />
            <div className="hs-body space-y-6 pl-6">
              {timeline.map((t) => (
                <div key={t.year} className="hs-timeline-item relative">
                  <span className="hs-timeline-dot absolute -left-[27px] top-1 h-2.5 w-2.5 rounded-full bg-[#F97316]" />
                  <div className="hs-display text-base font-bold text-[#F97316]">
                    {t.year}
                  </div>
                  <p className="mt-1 text-sm text-[#6B7280]">{t.text}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ============ CTA ============ */}
      <section className="px-4 py-16 sm:px-6">
        <Reveal>
          <div className="mx-auto flex max-w-4xl flex-col items-center rounded-[24px] border border-[#E5E7EB] bg-white px-6 py-11 text-center shadow-[0_20px_45px_-28px_rgba(31,41,55,0.25)]">
            <h2 className="hs-display text-2xl font-extrabold text-[#1F2937] sm:text-3xl">
              Want to work with us?
            </h2>
            <p className="hs-body mt-2 max-w-md text-sm text-[#6B7280]">
              We're always looking for verified professionals to join the
              QuickSeva network.
            </p>
            <button
              onClick={() => goTo("/register")}
              className="hs-cta-primary hs-body mt-6 rounded-2xl px-6 py-3 text-sm font-semibold text-white"
            >
              Become a professional
            </button>
          </div>
        </Reveal>
      </section>
    </div>
  );
};

export default About;