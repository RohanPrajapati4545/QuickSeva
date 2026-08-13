import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";

// NOTE: adjust this to match wherever VendorCategoryRoutes is actually
// mounted in your server (e.g. app.use("/api/vendor", ...)).
const CATEGORY_API = `${process.env.REACT_APP_API_URL}/api/vendor`;

const STAT_ICONS = {
  categories: "fa-tags",
  active: "fa-circle-check",
  bookings: "fa-calendar-check",
  rating: "fa-star",
};

// Small dashboard-top banner reflecting the vendor's own approval status.
// Only rendered when the vendor isn't approved yet (pending/rejected) —
// approved vendors don't need to see this.
const ApprovalStatusBanner = ({ approvalStatus }) => {
  const isRejected = approvalStatus === "rejected";

  return (
    <div
      className={`vdd-body mb-5 flex items-start gap-3 rounded-2xl border px-4 py-3.5 sm:items-center ${
        isRejected
          ? "border-red-200 bg-red-50 text-red-700"
          : "border-yellow-200 bg-yellow-50 text-yellow-800"
      }`}
    >
      <span
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${
          isRejected ? "bg-red-100 text-red-600" : "bg-yellow-100 text-yellow-600"
        }`}
      >
        <i className={`fa-solid ${isRejected ? "fa-circle-xmark" : "fa-hourglass-half"} text-xs`}></i>
      </span>
      <p className="text-xs font-medium leading-relaxed sm:text-sm">
        {isRejected ? (
          <>
            <span className="font-bold">Account rejected. </span>
            Admin has rejected your vendor account, so services can't be added or approved. Please contact support.
          </>
        ) : (
          <>
            <span className="font-bold">Approval pending. </span>
            Your account is awaiting admin approval — you'll be able to add services once it's approved.
          </>
        )}
      </p>
    </div>
  );
};

const VendorDashboard = () => {
  const { token, user } = useSelector((state) => state.auth || {});
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const vendorApprovalStatus = user?.approvalStatus || "pending";
  const isVendorApproved = vendorApprovalStatus === "approved";

  useEffect(() => {
    let cancelled = false;

    const fetchCategories = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${CATEGORY_API}/all-categories`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!cancelled) setCategories(res.data.categories || []);
      } catch (error) {
        if (!cancelled) {
          toast.error(error.response?.data?.msg || "Could not load categories");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    if (token) fetchCategories();
    return () => { cancelled = true; };
  }, [token]);

  const activeCount = categories.filter((c) => c.status).length;

  const stats = [
    { key: "categories", label: "Total categories", value: categories.length },
    { key: "active", label: "Active categories", value: activeCount },
    { key: "bookings", label: "Bookings this month", value: "—" },
    { key: "rating", label: "Average rating", value: "—" },
  ];

  return (
    <div className="vdd-body text-[#1F2937]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=Inter:wght@400;500;600;700&display=swap');
        .vdd-display { font-family: 'Sora', system-ui, sans-serif; }
        .vdd-body { font-family: 'Inter', system-ui, sans-serif; }

        .vdd-card { border-radius: 16px; transition: box-shadow 0.25s ease, transform 0.25s ease; }
        .vdd-card:hover { box-shadow: 0 20px 40px -26px rgba(31,41,55,0.2); }

        .vdd-cta-primary { background-color: #F97316; transition: background-color 0.2s ease, transform 0.2s ease; }
        .vdd-cta-primary:hover { background-color: #EA580C; transform: translateY(-1px); }

        .vdd-row { transition: background-color 0.2s ease; }
        .vdd-row:hover { background-color: #F8FAFC; }

        @keyframes vddSpin { to { transform: rotate(360deg); } }
        .vdd-spin { animation: vddSpin 0.8s linear infinite; }
      `}</style>

      {!isVendorApproved && <ApprovalStatusBanner approvalStatus={vendorApprovalStatus} />}

      {/* Header */}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <span className="vdd-body text-xs font-bold uppercase tracking-[0.2em] text-[#F97316]">
            Vendor Panel
          </span>
          <h1 className="vdd-display mt-1 text-2xl font-extrabold text-[#1F2937] sm:text-3xl">
            Welcome back{user?.name ? `, ${user.name.split(" ")[0]}` : ""}
          </h1>
          <p className="vdd-body mt-1 text-sm text-[#6B7280]">
            Here's how your service categories are doing today.
          </p>
        </div>
       
      </div>

      {/* Stat cards */}
      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.key} className="vdd-card border border-[#E5E7EB] bg-white p-4 sm:p-5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#F97316]/15 text-[#F97316]">
              <i className={`fa-solid ${STAT_ICONS[s.key]} text-sm`}></i>
            </div>
            <p className="vdd-display mt-3 text-2xl font-extrabold text-[#1F2937]">
              {loading && (s.key === "categories" || s.key === "active") ? "—" : s.value}
            </p>
            <p className="vdd-body mt-0.5 text-xs text-[#6B7280]">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Categories list */}
      <div className="vdd-card mt-8 border border-[#E5E7EB] bg-white">
        <div className="flex items-center justify-between border-b border-[#E5E7EB] px-5 py-4">
          <h2 className="vdd-display text-base font-bold text-[#1F2937]">Your categories</h2>
          <span
            onClick={() => navigate("/vendor/categories")}
            className="vdd-body cursor-pointer text-xs font-semibold text-[#F97316] hover:text-[#EA580C]"
          >
            View all →
          </span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-2 py-14 text-sm text-[#6B7280]">
            <i className="fa-solid fa-circle-notch vdd-spin text-[#F97316]"></i>
            Loading categories…
          </div>
        ) : categories.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-14 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F8FAFC] text-[#F97316]">
              <i className="fa-solid fa-tags text-lg"></i>
            </span>
            <div>
              <p className="vdd-body text-sm font-semibold text-[#1F2937]">No categories yet</p>
              <p className="vdd-body mt-0.5 text-xs text-[#6B7280]">
                Add your first category so customers can find your services.
              </p>
            </div>
            <button
              onClick={() => navigate("/vendor/categories-form")}
              className="vdd-cta-primary vdd-body mt-1 rounded-xl px-4 py-2 text-xs font-semibold text-white"
            >
              Add category
            </button>
          </div>
        ) : (
          <div className="divide-y divide-[#E5E7EB]">
            {categories.slice(0, 6).map((c) => (
              <div
                key={c._id}
                onClick={() => navigate(`/vendor/categories/edit/${c._id}`)}
                className="vdd-row flex cursor-pointer items-center gap-3 px-5 py-3.5"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#F8FAFC] text-[#F97316]">
                  <i className={`fa-solid ${c.icon || "fa-tags"} text-sm`}></i>
                </span>
                <div className="min-w-0 flex-1">
                  <p className="vdd-body truncate text-sm font-semibold text-[#1F2937]">{c.category_name}</p>
                  <p className="vdd-body truncate text-xs text-[#6B7280]">
                    {c.fields?.length || 0} custom field{c.fields?.length === 1 ? "" : "s"}
                  </p>
                </div>
                <span
                  className={`vdd-body shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                    c.status ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {c.status ? "Active" : "Inactive"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default VendorDashboard;