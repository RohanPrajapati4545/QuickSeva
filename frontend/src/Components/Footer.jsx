import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

const POPULAR_SERVICES = [
  { label: "Electrician", path: "/services/electrician" },
  { label: "Plumber", path: "/services/plumber" },
  { label: "Laptop Repair", path: "/services/laptop-repair" },
  { label: "AC Repair", path: "/services/ac-repair" },
  { label: "Car Mechanic", path: "/services/car-mechanic" },
  { label: "Home Cleaning", path: "/services/home-cleaning" },
];

const ROLE_LINKS = [
  { label: "Book a Service", path: "/services", icon: "fa-user" },
  { label: "Become a Vendor", path: "/register", icon: "fa-toolbox" },
  { label: "Admin Login", path: "/admin/login", icon: "fa-shield-halved" },
];

const Footer = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");

  const goTo = (path) => {
    navigate(path);
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  };

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email) return;
    Swal.fire({ icon: "success", title: "Subscribed!", timer: 1400, showConfirmButton: false });
    setEmail("");
  };

  return (
    <footer className="border-t border-[#E5E7EB] bg-[#1F2937] text-[#D1D5DB]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@700;800&family=Inter:wght@400;500;600&display=swap');
        .hs-display { font-family: 'Sora', system-ui, sans-serif; }
        .hs-body { font-family: 'Inter', system-ui, sans-serif; }
        .hs-footer-link { transition: color 0.2s ease, transform 0.2s ease; display: inline-block; }
        .hs-footer-link:hover { color: #F97316; transform: translateX(3px); }
        .hs-social-btn { transition: transform 0.25s ease, background-color 0.25s ease; }
        .hs-social-btn:hover { transform: translateY(-3px); background-color: #EA580C; }
      `}</style>

      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-4 py-12 sm:px-6 sm:grid-cols-4">
        <div className="col-span-2 flex flex-col gap-3 sm:col-span-1">
          <div className="hs-display flex items-center gap-2 text-lg font-extrabold text-white">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F97316]">
              <i className="fa-solid fa-bolt text-xs text-white"></i>
            </span>
            QuickSeva
          </div>
          <p className="hs-body mt-1 text-sm text-[#9CA3AF]">
            Verified home-service professionals, booked in minutes, priced upfront.
          </p>
        </div>

        <div className="hs-body flex flex-col gap-3">
          <span className="hs-display text-xs font-bold uppercase tracking-widest text-[#F97316]">
            Popular Services
          </span>
          {POPULAR_SERVICES.map((s) => (
            <span key={s.path} onClick={() => goTo(s.path)} className="hs-footer-link cursor-pointer text-sm">
              {s.label}
            </span>
          ))}
        </div>

        <div className="hs-body flex flex-col gap-3">
          <span className="hs-display text-xs font-bold uppercase tracking-widest text-[#F97316]">
            Get Started
          </span>
          {ROLE_LINKS.map((r) => (
            <span key={r.path} onClick={() => goTo(r.path)} className="hs-footer-link flex cursor-pointer items-center gap-2 text-sm">
              <i className={`fa-solid ${r.icon} text-xs`}></i>
              {r.label}
            </span>
          ))}
          <span onClick={() => goTo("/about")} className="hs-footer-link cursor-pointer text-sm">About Us</span>
          <span onClick={() => goTo("/contact")} className="hs-footer-link cursor-pointer text-sm">Contact Us</span>
        </div>

        <div className="hs-body col-span-2 flex flex-col gap-3 sm:col-span-1">
          <span className="hs-display text-xs font-bold uppercase tracking-widest text-[#F97316]">
            Stay in the loop
          </span>
          <p className="text-sm text-[#9CA3AF]">Offers and new services near you.</p>

          <form onSubmit={handleSubscribe} className="flex overflow-hidden rounded-2xl border border-white/15 focus-within:border-[#F97316]/60">
            <input
              type="email"
              placeholder="Your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-transparent px-4 py-2.5 text-sm text-white outline-none placeholder:text-[#6B7280]"
            />
            <button type="submit" className="shrink-0 bg-[#F97316] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#EA580C]">
              Join
            </button>
          </form>

          <div className="mt-2 flex gap-3">
            {["facebook-f", "twitter", "instagram"].map((icon) => (
              <a
                key={icon}
                href={`https://${icon.replace("-f", "")}.com`}
                target="_blank"
                rel="noreferrer"
                aria-label={icon}
                className="hs-social-btn flex h-8 w-8 items-center justify-center rounded-full bg-[#F97316] text-white"
              >
                <i className={`fa-brands fa-${icon} text-xs`}></i>
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="hs-body border-t border-white/10 py-4 text-center text-xs text-[#6B7280]">
        © {new Date().getFullYear()} QuickSeva. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;