import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Swal from "sweetalert2";
import axios from "axios";
import { logout } from "./../pages/Redux/AuthSlice";

const NAV_ITEMS = [
  { to: "/admin/dashboard", label: "Dashboard", icon: "fa-gauge" },
  { to: "/admin/vendors", label: "Vendors", icon: "fa-store" },
  { to: "/admin/users", label: "Users", icon: "fa-users" },
  { to: "/admin/categories", label: "Categories", icon: "fa-tags" },
  { to: "/admin/services", label: "Services", icon: "fa-screwdriver-wrench" },
  { to: "/admin/settings", label: "Settings", icon: "fa-gear" },
];

const API_URL = process.env.REACT_APP_API_URL;
// Same public endpoint Header.jsx uses — logoImage comes back as a full
// Cloudinary URL, so it's used as-is, no base-URL prefixing needed.
const CONTENT_API = `${API_URL}/api/content/header`;

const AdminSidebar = ({ onNavigate }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth || {});

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

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: "Log out?",
      text: "You'll need to sign in again to access the admin panel.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, log out",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#DC2626",
      cancelButtonColor: "#9CA3AF",
    });
    if (!result.isConfirmed) return;

    dispatch(logout());
    onNavigate?.();
    navigate("/login");
  };

  return (
    <div className="vd-body flex h-full flex-col text-white">
      <div className="flex items-center gap-2 px-5 py-5">
        {logoImage ? (
          <img
            src={logoImage}
            alt={logoText}
            className="h-9 w-9 rounded-lg object-cover"
            onError={(e) => (e.currentTarget.style.display = "none")}
          />
        ) : (
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#F97316] text-white">
            <i className="fa-solid fa-shield-halved text-sm"></i>
          </span>
        )}
        <span className="vd-display text-lg font-extrabold">
          {logoText}
          <span className="ml-1 text-xs font-semibold text-white/50">Admin</span>
        </span>
      </div>

      <nav className="mt-2 flex-1 space-y-1 px-3">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            className={({ isActive }) =>
              `vd-nav-item vd-body flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium ${
                isActive ? "vd-nav-active" : "text-white/70 hover:bg-white/5 hover:text-white"
              }`
            }
          >
            <i className={`fa-solid ${item.icon} w-4 text-center text-xs`}></i>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-white/10 px-3 py-4">
        {user?.email && (
          <div className="vd-body mb-2 flex items-center gap-2.5 rounded-xl px-3.5 py-2.5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#F97316]/20 text-[#F97316]">
              <i className="fa-solid fa-user text-xs"></i>
            </span>
            <span className="min-w-0 truncate text-xs font-medium text-white/60" title={user.email}>
              {user.email}
            </span>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="vd-body flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-white/70 hover:bg-white/5 hover:text-white"
        >
          <i className="fa-solid fa-right-from-bracket w-4 text-center text-xs"></i>
          Logout
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;