import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Swal from "sweetalert2";
import { logout } from "./../pages/Redux/AuthSlice";
import useDynamicContent from "../hooks/useDynamicContent";

// --- DEFAULT / FALLBACK CONTENT (same as before — shown until API responds) ---
const DEFAULT_HEADER_CONTENT = {
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
};

const BASE_URL = process.env.REACT_APP_API_URL;

const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (/^https?:\/\//i.test(imagePath)) return imagePath;
  const cleanBase = BASE_URL?.replace(/\/$/, "") || "";
  const cleanPath = imagePath.replace(/^\//, "").replace(/\\/g, "/");
  return `${cleanBase}/${cleanPath}`;
};

const Header = () => {
  const [showMenu, setShowMenu] = useState(false);
  const [showMobileNav, setShowMobileNav] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);
  const [desktopServicesOpen, setDesktopServicesOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuRef = useRef(null);
  const servicesRef = useRef(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { content } = useDynamicContent("header", DEFAULT_HEADER_CONTENT);
  const { navLinks, serviceLinks } = content;

  const { token, user } = useSelector((state) => state.auth || {});
  const avatarUrl = getImageUrl(user?.image);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setShowMenu(false);
      if (servicesRef.current && !servicesRef.current.contains(e.target)) setDesktopServicesOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 12);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const goTo = (path) => {
    setShowMenu(false);
    setShowMobileNav(false);
    setDesktopServicesOpen(false);
    navigate(path);
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  };

  const handleLogout = () => {
    setShowMenu(false);
    setShowMobileNav(false);
    Swal.fire({
      title: "Logout?",
      text: "Are you sure you want to logout?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Logout",
      confirmButtonColor: "#F97316",
    }).then((result) => {
      if (result.isConfirmed) {
        navigate("/");
        window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
        dispatch(logout());
      }
    });
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=Inter:wght@400;500;600&display=swap');
        .hs-display { font-family: 'Sora', system-ui, sans-serif; }
        .hs-body { font-family: 'Inter', system-ui, sans-serif; }

        .hs-header { transition: box-shadow 0.3s ease; }
        .hs-header-scrolled { box-shadow: 0 12px 30px -22px rgba(31,41,55,0.35); }

        .hs-nav-link { position: relative; color: #1F2937; font-weight: 600; font-size: 14px; }
        .hs-nav-link::after {
          content: ""; position: absolute; left: 0; right: 100%; bottom: -4px; height: 2px;
          background: #F97316; border-radius: 2px; transition: right 0.3s cubic-bezier(0.65,0,0.35,1);
        }
        .hs-nav-link:hover::after { right: 0; }

        .hs-logo-mark { transition: transform 0.4s cubic-bezier(0.16,1,0.3,1); }
        .hs-logo:hover .hs-logo-mark { transform: rotate(20deg) scale(1.05); }

        .hs-dropdown-wrap { position: relative; }
        .hs-dropdown-panel {
          position: absolute; top: calc(100% + 16px); left: 50%; transform: translate(-50%, 8px);
          opacity: 0; visibility: hidden; pointer-events: none;
          transition: opacity 0.2s ease, transform 0.2s ease, visibility 0.2s;
        }
        .hs-dropdown-wrap:hover .hs-dropdown-panel,
        .hs-dropdown-wrap:focus-within .hs-dropdown-panel,
        .hs-dropdown-panel.hs-dropdown-open {
          opacity: 1; visibility: visible; transform: translate(-50%, 0); pointer-events: auto;
        }
        .hs-chevron { transition: transform 0.25s ease; }
        .hs-dropdown-wrap:hover .hs-chevron,
        .hs-chevron.hs-chevron-open { transform: rotate(180deg); }
        .hs-drop-item { transition: background-color 0.2s ease, color 0.2s ease; border-radius: 12px; }
        .hs-drop-item:hover { background: #F8FAFC; color: #F97316; }

        .hs-cta-primary { background-color: #F97316; transition: background-color 0.25s ease, transform 0.2s ease; }
        .hs-cta-primary:hover { background-color: #EA580C; transform: translateY(-1px); }

        @keyframes hsOverlayIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes hsDrawerIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
        .hs-overlay { animation: hsOverlayIn 0.2s ease-out; }
        .hs-drawer-panel { animation: hsDrawerIn 0.3s cubic-bezier(0.16,1,0.3,1); }
        .hs-mobile-link { transition: background-color 0.2s ease, color 0.2s ease; border-radius: 12px; }
        .hs-mobile-link:hover { background: #F8FAFC; color: #F97316; }

        @media (prefers-reduced-motion: reduce) {
          .hs-drawer-panel, .hs-overlay { animation: none; }
        }
      `}</style>

      <header className={`hs-header sticky top-0 z-40 border-b border-[#E5E7EB] bg-white/90 backdrop-blur ${scrolled ? "hs-header-scrolled" : ""}`}>
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-[18px] sm:px-6">
          <div className="hs-logo flex cursor-pointer items-center gap-2.5" onClick={() => goTo("/")}>
            <span className="hs-logo-mark flex h-10 w-10 items-center justify-center rounded-xl bg-[#F97316] text-white">
              <i className="fa-solid fa-bolt text-base"></i>
            </span>
            <span className="hs-display text-2xl font-extrabold text-[#1F2937]">
              Quick<span className="text-[#F97316]">Seva</span>
            </span>
          </div>

          <button className="text-[#1F2937] md:hidden" onClick={() => setShowMobileNav(true)} aria-label="Open menu">
            <i className="fa-solid fa-bars text-xl"></i>
          </button>

          <div className="hidden items-center gap-8 md:flex">
            <nav className="hs-body flex items-center gap-9">
              {navLinks.map((link) =>
                link.dropdown ? (
                  <div key={link.path} className="hs-dropdown-wrap" tabIndex={0} ref={servicesRef}>
                    <span
                      onClick={() => setDesktopServicesOpen((p) => !p)}
                      className="hs-nav-link flex cursor-pointer items-center gap-1.5 text-[15px]"
                    >
                      {link.label}
                      <i className={`hs-chevron fa-solid fa-chevron-down text-[10px] ${desktopServicesOpen ? "hs-chevron-open" : ""}`}></i>
                    </span>
                    <div
                      className={`hs-dropdown-panel z-50 grid w-[500px] grid-cols-2 gap-1 rounded-2xl border border-[#E5E7EB] bg-white p-3 shadow-[0_24px_60px_-24px_rgba(31,41,55,0.3)] ${desktopServicesOpen ? "hs-dropdown-open" : ""}`}
                    >
                      {serviceLinks.map((s) => (
                        <span key={s.path} onClick={() => goTo(s.path)} className="hs-drop-item flex cursor-pointer items-center gap-2.5 px-3 py-2.5 text-sm text-[#374151]">
                          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#F8FAFC] text-[#F97316]">
                            <i className={`fa-solid ${s.icon} text-xs`}></i>
                          </span>
                          {s.label}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : (
                  <span key={link.path} onClick={() => goTo(link.path)} className="hs-nav-link cursor-pointer text-[15px]">
                    {link.label}
                  </span>
                )
              )}
            </nav>

            <div className="relative" ref={menuRef}>
              {token ? (
                <button onClick={() => setShowMenu((p) => !p)} className="block">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt=""
                      className="h-10 w-10 rounded-full border-2 border-[#F97316] object-cover transition-transform hover:scale-105"
                      onError={(e) => (e.currentTarget.style.display = "none")}
                    />
                  ) : (
                    <i className="fa-solid fa-circle-user text-[26px] text-[#1F2937]"></i>
                  )}
                </button>
              ) : (
                <button onClick={() => goTo("/login")} className="hs-cta-primary hs-body rounded-2xl px-6 py-2.5 text-sm font-semibold text-white">
                  Sign In
                </button>
              )}

              {token && showMenu && (
                <div className="hs-body absolute right-0 mt-3 w-48 overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-[0_24px_60px_-24px_rgba(31,41,55,0.3)]">
                  <div onClick={() => goTo("/profile")} className="flex cursor-pointer items-center gap-2 px-4 py-3 text-sm text-[#1F2937] hover:bg-[#F8FAFC]">
                    <i className="fa-solid fa-user text-[#F97316]"></i> Profile
                  </div>
                  <div onClick={() => goTo("/my-bookings")} className="flex cursor-pointer items-center gap-2 px-4 py-3 text-sm text-[#1F2937] hover:bg-[#F8FAFC]">
                    <i className="fa-solid fa-calendar-check text-[#F97316]"></i> My Bookings
                  </div>
                  <div onClick={handleLogout} className="flex cursor-pointer items-center gap-2 px-4 py-3 text-sm text-red-500 hover:bg-red-50">
                    <i className="fa-solid fa-right-from-bracket"></i> Logout
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {showMobileNav && (
        <div className="hs-overlay fixed inset-0 z-50 bg-[#1F2937]/50" onClick={() => setShowMobileNav(false)}>
          <div className="hs-drawer-panel ml-auto flex h-full w-72 flex-col rounded-l-3xl bg-white px-5 py-5" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <span className="hs-display text-lg font-extrabold text-[#1F2937]">
                Quick<span className="text-[#F97316]">Seva</span>
              </span>
              <i className="fa-solid fa-xmark cursor-pointer text-lg text-[#1F2937]" onClick={() => setShowMobileNav(false)}></i>
            </div>

            <div className="hs-body mt-8 flex flex-col gap-1">
              <div>
                <span
                  onClick={() => setMobileServicesOpen((p) => !p)}
                  className="hs-mobile-link flex cursor-pointer items-center justify-between px-3 py-3 text-sm font-semibold text-[#1F2937]"
                >
                  Services
                  <i className={`fa-solid fa-chevron-down text-[10px] transition-transform ${mobileServicesOpen ? "rotate-180" : ""}`}></i>
                </span>
                {mobileServicesOpen && (
                  <div className="ml-2 flex flex-col border-l border-[#E5E7EB] pl-3">
                    {serviceLinks.map((s) => (
                      <span key={s.path} onClick={() => goTo(s.path)} className="hs-mobile-link flex cursor-pointer items-center gap-2 px-3 py-2 text-sm text-[#6B7280]">
                        <i className={`fa-solid ${s.icon} text-[11px] text-[#F97316]`}></i>
                        {s.label}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <span onClick={() => goTo("/about")} className="hs-mobile-link cursor-pointer px-3 py-3 text-sm font-semibold text-[#1F2937]">About</span>
              <span onClick={() => goTo("/contact")} className="hs-mobile-link cursor-pointer px-3 py-3 text-sm font-semibold text-[#1F2937]">Contact</span>

              {token ? (
                <>
                  <span onClick={() => goTo("/profile")} className="hs-mobile-link cursor-pointer px-3 py-3 text-sm font-semibold text-[#1F2937]">Profile</span>
                  <span onClick={() => goTo("/my-bookings")} className="hs-mobile-link cursor-pointer px-3 py-3 text-sm font-semibold text-[#1F2937]">My Bookings</span>
                  <span onClick={handleLogout} className="hs-mobile-link cursor-pointer px-3 py-3 text-sm font-semibold text-red-500">Logout</span>
                </>
              ) : (
                <button onClick={() => goTo("/login")} className="hs-cta-primary mt-3 rounded-2xl px-5 py-3 text-sm font-semibold text-white">
                  Sign In
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;