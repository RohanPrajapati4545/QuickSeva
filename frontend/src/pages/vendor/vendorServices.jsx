import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";

const SERVICE_API = `${process.env.REACT_APP_API_URL}/api/vendor-service`;
const BASE_URL = process.env.REACT_APP_API_URL;

// NOTE: adjust this to match wherever your vendorProfileRoutes router is
// mounted in your server, e.g. app.use("/api/vendor-profile", ...).
const PROFILE_API = `${process.env.REACT_APP_API_URL}/api/vendor-profile`;
const SEARCH_DEBOUNCE_MS = 400;

const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (/^https?:\/\//i.test(imagePath)) return imagePath;
  const cleanBase = BASE_URL?.replace(/\/$/, "") || "";
  const cleanPath = imagePath.replace(/^\//, "");
  return `${cleanBase}/${cleanPath}`;
};

const APPROVAL_STYLES = {
  pending: "bg-yellow-50 text-yellow-600",
  approved: "bg-green-50 text-green-600",
  rejected: "bg-red-50 text-red-500",
};

// Shown in place of the whole page when the vendor's own account hasn't
// been approved by admin yet — mirrors the empty-state / dashboard visual
// language used elsewhere in the vendor panel.
const VendorNotApprovedNotice = ({ approvalStatus }) => {
  const isRejected = approvalStatus === "rejected";

  return (
    <div className="vs-body text-[#1F2937]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=Inter:wght@400;500;600;700&display=swap');
        .vs-display { font-family: 'Sora', system-ui, sans-serif; }
        .vs-body { font-family: 'Inter', system-ui, sans-serif; }
        .vs-card { border-radius: 16px; }
      `}</style>

      <div>
        <h1 className="vs-display text-2xl font-extrabold sm:text-3xl">Services</h1>
        <p className="vs-body mt-1 text-sm text-[#6B7280]">
          Manage the services you offer to customers.
        </p>
      </div>

      <div className="vs-card mt-5 flex flex-col items-center justify-center gap-3 border border-[#E5E7EB] bg-white px-6 py-16 text-center">
        <span
          className={`flex h-14 w-14 items-center justify-center rounded-2xl text-2xl ${
            isRejected ? "bg-red-50 text-red-500" : "bg-yellow-50 text-yellow-600"
          }`}
        >
          <i className={`fa-solid ${isRejected ? "fa-circle-xmark" : "fa-hourglass-half"}`}></i>
        </span>
        <div className="max-w-sm">
          <p className="vs-display text-base font-bold text-[#1F2937]">
            {isRejected ? "Your account was rejected" : "Your account is pending approval"}
          </p>
          <p className="vs-body mt-1.5 text-sm text-[#6B7280]">
            {isRejected
              ? "Admin has rejected your vendor account, so you can't add or manage services right now. Please contact support for more details."
              : "You'll be able to add and manage services once admin approves your vendor account. This usually doesn't take long — check back soon."}
          </p>
        </div>
      </div>
    </div>
  );
};

const VendorServices = () => {
  // Sirf token Redux se — approvalStatus ab kabhi Redux se nahi liya jaata,
  // hamesha DB se (/api/vendor-profile/profile) ek baar fetch hota hai
  // (page load / refresh par). Koi polling nahi.
  const { token } = useSelector((state) => state.auth || {});
  const navigate = useNavigate();

  const [vendorUser, setVendorUser] = useState(null);
  const [approvalLoading, setApprovalLoading] = useState(true);

  const vendorApprovalStatus = vendorUser?.approvalStatus || "pending";
  const isVendorApproved = vendorApprovalStatus === "approved";

  const fetchMyProfile = useCallback(async () => {
    if (!token) return;
    setApprovalLoading(true);
    try {
      const res = await axios.get(`${PROFILE_API}/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setVendorUser(res.data.user || null);
    } catch (error) {
      // token invalid/expired waghera — silently ignore, existing
      // auth flow apni jagah handle karega
    } finally {
      setApprovalLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!token) return;
    fetchMyProfile();
  }, [token, fetchMyProfile]);

  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

  // Debounce the raw input so we don't fire a request on every keystroke,
  // just SEARCH_DEBOUNCE_MS after the user pauses typing.
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [search]);

  // Only `q` goes to the backend. Active/Inactive stays client-side and is
  // filtered from this same search-matched list, so every chip's count is
  // always correct.
  const fetchServices = async ({ q } = {}) => {
    setLoading(true);
    try {
      const params = {};
      if (q) params.q = q;

      const res = await axios.get(`${SERVICE_API}/all-services`, {
        ...authHeaders,
        params,
      });
      setServices(res.data.services || []);
    } catch (error) {
      toast.error(error.response?.data?.msg || "Could not load services");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Vendor abhi approved nahi hai to services fetch karne ki zarurat hi
    // nahi — notice screen dikha denge.
    if (token && isVendorApproved) fetchServices({ q: debouncedSearch });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, debouncedSearch, isVendorApproved]);

  const goToDetails = (service) => {
    navigate(`/vendor/services/${service._id}`, { state: { service } });
  };

  const filteredServices =
    statusFilter === "all"
      ? services
      : services.filter((s) => (statusFilter === "active" ? s.status : !s.status));

  // Jab tak DB se approval status pehli baar fetch nahi ho jaata, kuch mat
  // dikhao — warna "pending" screen ek pal ke liye flash ho sakti hai.
  if (approvalLoading) {
    return (
      <div className="flex items-center justify-center gap-2 py-24 text-sm text-[#6B7280]">
        <i className="fa-solid fa-circle-notch animate-spin text-[#F97316]"></i>
        Loading…
      </div>
    );
  }

  if (!isVendorApproved) {
    return <VendorNotApprovedNotice approvalStatus={vendorApprovalStatus} />;
  }

  return (
    <div className="vs-body text-[#1F2937]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=Inter:wght@400;500;600;700&display=swap');
        .vs-display { font-family: 'Sora', system-ui, sans-serif; }
        .vs-body { font-family: 'Inter', system-ui, sans-serif; }
        .vs-card { border-radius: 16px; transition: box-shadow 0.25s ease; }
        .vs-row { transition: background-color 0.2s ease; cursor: pointer; }
        .vs-row:hover { background-color: #F8FAFC; }
        .vs-chip { transition: background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease; }
        .vs-cta-primary { background-color: #F97316; transition: background-color 0.2s ease, transform 0.2s ease; }
        .vs-cta-primary:hover { background-color: #EA580C; transform: translateY(-1px); }
        .vs-input { transition: border-color 0.2s ease, box-shadow 0.2s ease; }
        .vs-input:focus { border-color: #F97316; box-shadow: 0 0 0 3px rgba(249,115,22,0.15); }
        @keyframes vsSpin { to { transform: rotate(360deg); } }
        .vs-spin { animation: vsSpin 0.8s linear infinite; }
      `}</style>

      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="vs-display text-2xl font-extrabold sm:text-3xl">Services</h1>
          <p className="vs-body mt-1 text-sm text-[#6B7280]">
            Manage the services you offer to customers. New and edited services need admin approval before they go live.
          </p>
        </div>
        <button
          onClick={() => navigate("/vendor/services-form")}
          className="vs-cta-primary vs-body flex shrink-0 items-center gap-2 rounded-2xl px-5 py-2.5 text-sm font-semibold text-white"
        >
          <i className="fa-solid fa-plus text-xs"></i>
          Add service
        </button>
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          <span
            onClick={() => setStatusFilter("all")}
            className={`vs-chip vs-body cursor-pointer rounded-full border px-4 py-1.5 text-xs font-semibold ${
              statusFilter === "all"
                ? "border-[#F97316] bg-[#F97316] text-white"
                : "border-[#E5E7EB] text-[#6B7280] hover:border-[#F97316]"
            }`}
          >
            All ({services.length})
          </span>
          <span
            onClick={() => setStatusFilter("active")}
            className={`vs-chip vs-body cursor-pointer rounded-full border px-4 py-1.5 text-xs font-semibold ${
              statusFilter === "active"
                ? "border-[#F97316] bg-[#F97316] text-white"
                : "border-[#E5E7EB] text-[#6B7280] hover:border-[#F97316]"
            }`}
          >
            Active ({services.filter((s) => s.status).length})
          </span>
          <span
            onClick={() => setStatusFilter("inactive")}
            className={`vs-chip vs-body cursor-pointer rounded-full border px-4 py-1.5 text-xs font-semibold ${
              statusFilter === "inactive"
                ? "border-[#F97316] bg-[#F97316] text-white"
                : "border-[#E5E7EB] text-[#6B7280] hover:border-[#F97316]"
            }`}
          >
            Inactive ({services.filter((s) => !s.status).length})
          </span>
        </div>

        <div className="relative w-full sm:w-64">
          <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-[#9CA3AF]"></i>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search services…"
            className="vs-input vs-body w-full rounded-xl border border-[#E5E7EB] py-2 pl-9 pr-9 text-sm outline-none"
          />
          {search !== debouncedSearch && (
            <i className="fa-solid fa-circle-notch vs-spin absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#F97316]"></i>
          )}
        </div>
      </div>

      <div className="vs-card mt-5 border border-[#E5E7EB] bg-white">
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-14 text-sm text-[#6B7280]">
            <i className="fa-solid fa-circle-notch vs-spin text-[#F97316]"></i>
            Loading services…
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-14 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F8FAFC] text-[#F97316]">
              <i className="fa-solid fa-screwdriver-wrench text-lg"></i>
            </span>
            <div>
              <p className="vs-body text-sm font-semibold">No services found</p>
              <p className="vs-body mt-0.5 text-xs text-[#6B7280]">
                {debouncedSearch
                  ? "Try a different search term."
                  : statusFilter === "all"
                  ? "Add your first service so customers can book it."
                  : `No ${statusFilter} services right now.`}
              </p>
            </div>
            {statusFilter === "all" && !debouncedSearch && (
              <button
                onClick={() => navigate("/vendor/services-form")}
                className="vs-cta-primary vs-body mt-1 rounded-xl px-4 py-2 text-xs font-semibold text-white"
              >
                Add service
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-[#E5E7EB]">
            {filteredServices.map((s) => (
              <div
                key={s._id}
                onClick={() => goToDetails(s)}
                className="vs-row flex items-center gap-3 px-5 py-4"
              >
                {s.image ? (
                  <img
                    src={getImageUrl(s.image)}
                    alt=""
                    className="h-11 w-11 shrink-0 rounded-xl object-cover"
                  />
                ) : (
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#F8FAFC] text-[#F97316]">
                    <i className={`fa-solid ${s.category?.icon || "fa-tags"} text-sm`}></i>
                  </span>
                )}

                <div className="min-w-0 flex-1">
                  <p className="vs-body truncate text-sm font-semibold">{s.service_name}</p>
                  <p className="vs-body truncate text-xs text-[#6B7280]">
                    {s.category?.category_name || "—"}
                  </p>
                </div>

                <p className="vs-body hidden shrink-0 text-sm font-bold text-[#F97316] sm:block">
                  ₹{s.price}
                </p>

                <span
                  className={`vs-chip vs-body shrink-0 rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                    APPROVAL_STYLES[s.approvalStatus || "pending"]
                  }`}
                >
                  {s.approvalStatus || "pending"}
                </span>

                <span
                  className={`vs-chip vs-body hidden shrink-0 rounded-full px-3 py-1 text-xs font-semibold sm:block ${
                    s.status ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {s.status ? "Active" : "Inactive"}
                </span>

                <i className="fa-solid fa-chevron-right shrink-0 text-xs text-[#9CA3AF]"></i>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default VendorServices;