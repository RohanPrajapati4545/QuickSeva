import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Swal from "sweetalert2";
import axios from "axios";
import { logout } from "./../pages/Redux/AuthSlice";

const NAV_ITEMS = [
  { label: "Dashboard", icon: "fa-grid-2", path: "/vendor/dashboard", end: true },
  { label: "Categories", icon: "fa-tags", path: "/vendor/categories" },
  { label: "Services", icon: "fa-screwdriver-wrench", path: "/vendor/services" },
  { label: "Bookings", icon: "fa-calendar-check", path: "/vendor/bookings" },
  { label: "Profile", icon: "fa-user", path: "/vendor/profile" },
];

const BASE_URL = process.env.REACT_APP_API_URL;
// Same public endpoint Header.jsx uses — logoImage comes back as a full
// Cloudinary URL, so it's used as-is, no base-URL prefixing needed.
const CONTENT_API = `${BASE_URL}/api/content/header`;

// used only for locally-stored files (e.g. vendor avatar uploaded to
// /uploads on this server) — NOT for the header logo, which is a full
// Cloudinary URL and must be used as-is
const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (/^https?:\/\//i.test(imagePath)) return imagePath;
  const cleanBase = BASE_URL?.replace(/\/$/, "") || "";
  const cleanPath = imagePath.replace(/^\//, "").replace(/\\/g, "/");
  return `${cleanBase}/${cleanPath}`;
};

const VendorSidebar = ({ onNavigate }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth || {});
  const avatarUrl = getImageUrl(user?.image);

  // logo — fetched once on mount, falls back to "QuickSeva" + bolt icon
  // until it resolves (or if it fails), so the sidebar never looks empty.
  const [logoText, setLogoText] = useState("QuickSeva");
  const [logoImage, setLogoImage] = useState("");

  useEffect(() => {
    const fetchLogo = async () => {
      try {
        const res = await axios.get(CONTENT_API);
        if (res.data?.content) {
          setLogoText(res.data.content.logoText || "QuickSeva");
          setLogoImage(res.data.content.logoImage || "");
        }
      } catch (error) {
        console.log(error);
        // silently keep defaults — sidebar shouldn't break if this fails
      }
    };
    fetchLogo();

    // Instant sync: AdminHeaderContent fires this event right after a
    // successful save, so the sidebar updates immediately without waiting
    // for a route change/remount or re-fetching from the server.
    const handleLogoUpdated = (e) => {
      if (!e.detail) return;
      setLogoText(e.detail.logoText || "QuickSeva");
      setLogoImage(e.detail.logoImage || "");
    };
    window.addEventListener("headerLogoUpdated", handleLogoUpdated);
    return () => window.removeEventListener("headerLogoUpdated", handleLogoUpdated);
  }, []);

  const handleLogout = () => {
    onNavigate?.();
    Swal.fire({
      title: "Logout?",
      text: "Are you sure you want to logout?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Logout",
      confirmButtonColor: "#F97316",
    }).then((result) => {
      if (result.isConfirmed) {
        dispatch(logout());
        navigate("/");
      }
    });
  };

  return (
    <div className="flex h-full w-full flex-col">
      <div
        className="vd-logo flex cursor-pointer items-center gap-2.5 px-5 pt-6"
        onClick={() => { onNavigate?.(); navigate("/vendor/dashboard"); }}
      >
        {logoImage ? (
          <img
            src={logoImage}
            alt={logoText}
            className="h-9 w-9 rounded-xl object-cover"
            onError={(e) => (e.currentTarget.style.display = "none")}
          />
        ) : (
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#F97316] text-white">
            <i className="fa-solid fa-bolt text-sm"></i>
          </span>
        )}
        <span className="vd-display text-lg font-extrabold text-white">
          {logoText}
        </span>
      </div>
      <p className="vd-body px-5 pt-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/35">
        Vendor Panel
      </p>

      <nav className="vd-body mt-6 flex flex-1 flex-col gap-1 px-3">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.end}
            onClick={onNavigate}
            className={({ isActive }) =>
              `vd-nav-item flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium ${
                isActive ? "vd-nav-active" : "text-white/60 hover:text-white"
              }`
            }
          >
            <i className={`fa-solid ${item.icon} w-4 text-center text-[13px]`}></i>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="vd-body mx-3 mb-5 mt-auto rounded-2xl bg-white/5 p-3">
        <div className="flex items-center gap-2.5">
          {avatarUrl ? (
            <img src={avatarUrl} alt="" className="h-9 w-9 rounded-full border-2 border-[#F97316] object-cover" />
          ) : (
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white/70">
              <i className="fa-solid fa-user text-xs"></i>
            </span>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-white">{user?.name || "Vendor"}</p>
            <p className="truncate text-[11px] text-white/40">{user?.email || ""}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 py-2 text-xs font-semibold text-white/70 transition-colors hover:border-red-400/40 hover:text-red-400"
        >
          <i className="fa-solid fa-right-from-bracket text-[11px]"></i>
          Logout
        </button>
      </div>
    </div>
  );
};

export default VendorSidebar;