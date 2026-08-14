import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Swal from "sweetalert2";
import { logout } from "./../pages/Redux/AuthSlice";

const NAV_ITEMS = [
  { to: "/admin/dashboard", label: "Dashboard", icon: "fa-gauge" },
  { to: "/admin/vendors", label: "Vendors", icon: "fa-store" },
  { to: "/admin/users", label: "Users", icon: "fa-users" },
  { to: "/admin/categories", label: "Categories", icon: "fa-tags" },
  { to: "/admin/services", label: "Services", icon: "fa-screwdriver-wrench" },
  { to: "/admin/website-content", label: "Website Content", icon: "fa-pen-to-square" },
];

const AdminSidebar = ({ onNavigate }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth || {});

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
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#F97316] text-white">
          <i className="fa-solid fa-shield-halved text-sm"></i>
        </span>
        <span className="vd-display text-lg font-extrabold">
          Quick<span className="text-[#F97316]">Seva</span>
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