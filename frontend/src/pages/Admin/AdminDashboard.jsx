import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";

const ADMIN_API = `${process.env.REACT_APP_API_URL}/api/admin`;

const STAT_ICONS = {
  vendors: "fa-store",
  pending: "fa-hourglass-half",
  users: "fa-users",
  bookings: "fa-calendar-check",
};

const AdminDashboard = () => {
  const { token, user } = useSelector((state) => state.auth || {});
  const navigate = useNavigate();

  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recentVendors, setRecentVendors] = useState([]);

  useEffect(() => {
    let cancelled = false;

    const fetchSummary = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${ADMIN_API}/dashboard-summary`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!cancelled) {
          setSummary(res.data.summary || null);
          setRecentVendors(res.data.recentVendors || []);
        }
      } catch (error) {
        if (!cancelled) toast.error(error.response?.data?.msg || "Could not load dashboard");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    if (token) fetchSummary();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const stats = [
    { key: "vendors", label: "Total vendors", value: summary?.totalVendors ?? "—" },
    { key: "pending", label: "Pending approvals", value: summary?.pendingVendors ?? "—" },
    { key: "users", label: "Total users", value: summary?.totalUsers ?? "—" },
    { key: "bookings", label: "Total bookings", value: summary?.totalBookings ?? "—" },
  ];

  return (
    <div className="vdd-body text-[#1F2937]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=Inter:wght@400;500;600;700&display=swap');
        .vdd-display { font-family: 'Sora', system-ui, sans-serif; }
        .vdd-body { font-family: 'Inter', system-ui, sans-serif; }
        .vdd-card { border-radius: 16px; transition: box-shadow 0.25s ease; }
        .vdd-card:hover { box-shadow: 0 20px 40px -26px rgba(31,41,55,0.2); }
        .vdd-row { transition: background-color 0.2s ease; }
        .vdd-row:hover { background-color: #F8FAFC; }
        @keyframes vddSpin { to { transform: rotate(360deg); } }
        .vdd-spin { animation: vddSpin 0.8s linear infinite; }
      `}</style>

      <div>
        <span className="vdd-body text-xs font-bold uppercase tracking-[0.2em] text-[#F97316]">
          Admin Panel
        </span>
        <h1 className="vdd-display mt-1 text-2xl font-extrabold sm:text-3xl">
          Welcome back{user?.name ? `, ${user.name.split(" ")[0]}` : ""}
        </h1>
        <p className="vdd-body mt-1 text-sm text-[#6B7280]">
          Here's how the platform is doing today.
        </p>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.key} className="vdd-card border border-[#E5E7EB] bg-white p-4 sm:p-5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#F97316]/15 text-[#F97316]">
              <i className={`fa-solid ${STAT_ICONS[s.key]} text-sm`}></i>
            </div>
            <p className="vdd-display mt-3 text-2xl font-extrabold">
              {loading ? "—" : s.value}
            </p>
            <p className="vdd-body mt-0.5 text-xs text-[#6B7280]">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="vdd-card mt-8 border border-[#E5E7EB] bg-white">
        <div className="flex items-center justify-between border-b border-[#E5E7EB] px-5 py-4">
          <h2 className="vdd-display text-base font-bold">Recent vendor signups</h2>
          <span
            onClick={() => navigate("/admin/vendors")}
            className="vdd-body cursor-pointer text-xs font-semibold text-[#F97316] hover:text-[#EA580C]"
          >
            View all →
          </span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-2 py-14 text-sm text-[#6B7280]">
            <i className="fa-solid fa-circle-notch vdd-spin text-[#F97316]"></i>
            Loading…
          </div>
        ) : recentVendors.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-14 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F8FAFC] text-[#F97316]">
              <i className="fa-solid fa-store-slash text-lg"></i>
            </span>
            <p className="vdd-body text-sm font-semibold">No vendors yet</p>
          </div>
        ) : (
          <div className="divide-y divide-[#E5E7EB]">
            {recentVendors.map((v) => (
              <div
                key={v._id}
                onClick={() => navigate(`/admin/vendors/${v._id}`, { state: { vendor: v } })}
                className="vdd-row flex cursor-pointer items-center gap-3 px-5 py-3.5"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F8FAFC] text-[#F97316]">
                  <i className="fa-solid fa-store text-sm"></i>
                </span>
                <div className="min-w-0 flex-1">
                  <p className="vdd-body truncate text-sm font-semibold">
                    {v.shop_name || v.name}
                  </p>
                  <p className="vdd-body truncate text-xs text-[#6B7280]">{v.email}</p>
                </div>
                <span
                  className={`vdd-body shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize ${
                    v.approvalStatus === "approved"
                      ? "bg-green-50 text-green-600"
                      : v.approvalStatus === "rejected"
                      ? "bg-red-50 text-red-500"
                      : "bg-yellow-50 text-yellow-600"
                  }`}
                >
                  {v.approvalStatus || "pending"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;