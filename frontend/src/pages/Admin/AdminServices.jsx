import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";

const SERVICE_API = `${process.env.REACT_APP_API_URL}/api/admin/services`;
const BASE_URL = process.env.REACT_APP_API_URL;
const SEARCH_DEBOUNCE_MS = 400;
const PAGE_SIZE = 20;

const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (/^https?:\/\//i.test(imagePath)) return imagePath;
  const cleanBase = BASE_URL?.replace(/\/$/, "") || "";
  const cleanPath = imagePath.replace(/^\//, "");
  return `${cleanBase}/${cleanPath}`;
};

const STATUS_STYLES = {
  pending: "bg-yellow-50 text-yellow-600",
  approved: "bg-green-50 text-green-600",
  rejected: "bg-red-50 text-red-500",
};

const AdminServices = () => {
  const { token } = useSelector((state) => state.auth || {});
  const navigate = useNavigate();

  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  // Default tab is now "all" so every service shows up first,
  // with "pending" and the other tabs still available to switch to.
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });
  const [counts, setCounts] = useState({ all: 0, pending: 0, approved: 0, rejected: 0 });

  const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [search]);

  // Reset to page 1 whenever the search term or status tab changes.
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, statusFilter]);

  // `status` + `q` + `page` all go to the backend for the actual list.
  // The backend independently returns `counts` computed from `q` alone
  // (ignoring status), so every tab's number is always correct no matter
  // which tab or page is currently selected.
  const fetchServices = async ({ status, q, pageNum } = {}) => {
    setLoading(true);
    try {
      const params = { page: pageNum || 1, limit: PAGE_SIZE };
      if (status && status !== "all") params.status = status;
      if (q) params.q = q;

      const res = await axios.get(`${SERVICE_API}/all-services`, {
        ...authHeaders,
        params,
      });
      setServices(res.data.services || []);
      setPagination(res.data.pagination || { total: 0, totalPages: 1 });
      if (res.data.counts) setCounts(res.data.counts);
    } catch (error) {
      toast.error(error.response?.data?.msg || "Could not load services");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchServices({ status: statusFilter, q: debouncedSearch, pageNum: page });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, statusFilter, debouncedSearch, page]);

  const goToDetails = (service) => {
    navigate(`/admin/services/${service._id}`, { state: { service } });
  };

  const countFor = (status) => counts[status] ?? 0;

  const { totalPages, total } = pagination;
  const rangeStart = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(page * PAGE_SIZE, total);

  return (
    <div className="as-body text-[#1F2937]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=Inter:wght@400;500;600;700&display=swap');
        .as-display { font-family: 'Sora', system-ui, sans-serif; }
        .as-body { font-family: 'Inter', system-ui, sans-serif; }
        .as-card { border-radius: 16px; transition: box-shadow 0.25s ease; }
        .as-row { transition: background-color 0.2s ease; cursor: pointer; }
        .as-row:hover { background-color: #F8FAFC; }
        .as-chip { transition: background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease; }
        .as-input { transition: border-color 0.2s ease, box-shadow 0.2s ease; }
        .as-input:focus { border-color: #F97316; box-shadow: 0 0 0 3px rgba(249,115,22,0.15); }
        .as-page-btn { transition: background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease; }
        .as-page-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        @keyframes asSpin { to { transform: rotate(360deg); } }
        .as-spin { animation: asSpin 0.8s linear infinite; }
      `}</style>

      <div>
        <h1 className="as-display text-2xl font-extrabold sm:text-3xl">Services</h1>
        <p className="as-body mt-1 text-sm text-[#6B7280]">
          Review vendor-submitted services before they go live for customers.
        </p>
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {["all", "pending", "approved", "rejected"].map((s) => (
            <span
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`as-chip as-body cursor-pointer rounded-full border px-4 py-1.5 text-xs font-semibold capitalize ${
                statusFilter === s
                  ? "border-[#F97316] bg-[#F97316] text-white"
                  : "border-[#E5E7EB] text-[#6B7280] hover:border-[#F97316]"
              }`}
            >
              {s} ({countFor(s)})
            </span>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-[#9CA3AF]"></i>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search services…"
            className="as-input as-body w-full rounded-xl border border-[#E5E7EB] py-2 pl-9 pr-9 text-sm outline-none"
          />
          {search !== debouncedSearch && (
            <i className="fa-solid fa-circle-notch as-spin absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#F97316]"></i>
          )}
        </div>
      </div>

      <div className="as-card mt-5 border border-[#E5E7EB] bg-white">
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-14 text-sm text-[#6B7280]">
            <i className="fa-solid fa-circle-notch as-spin text-[#F97316]"></i>
            Loading services…
          </div>
        ) : services.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-14 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F8FAFC] text-[#F97316]">
              <i className="fa-solid fa-screwdriver-wrench text-lg"></i>
            </span>
            <div>
              <p className="as-body text-sm font-semibold">No services found</p>
              <p className="as-body mt-0.5 text-xs text-[#6B7280]">
                {debouncedSearch
                  ? "Try a different search term."
                  : statusFilter === "all"
                  ? "No services yet."
                  : `No ${statusFilter} services right now.`}
              </p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-[#E5E7EB]">
            {services.map((s) => (
              <div
                key={s._id}
                onClick={() => goToDetails(s)}
                className="as-row flex items-center gap-3 px-5 py-4"
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
                  <p className="as-body truncate text-sm font-semibold">{s.service_name}</p>
                  {/* Vendor's owner name is shown here instead of the shop name */}
                  <p className="as-body truncate text-xs text-[#6B7280]">
                    {s.vendor?.name || s.vendor?.shop_name || "—"} · {s.category?.category_name || "—"}
                  </p>
                </div>

                <p className="as-body hidden shrink-0 text-sm font-bold text-[#F97316] sm:block">
                  ₹{s.price}
                </p>

                <span
                  className={`as-chip as-body shrink-0 rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                    STATUS_STYLES[s.approvalStatus || "pending"]
                  }`}
                >
                  {s.approvalStatus || "pending"}
                </span>

                <i className="fa-solid fa-chevron-right shrink-0 text-xs text-[#9CA3AF]"></i>
              </div>
            ))}
          </div>
        )}

        {!loading && total > 0 && (
          <div className="flex flex-col items-center justify-between gap-3 border-t border-[#E5E7EB] px-5 py-3.5 sm:flex-row">
            <p className="as-body text-xs text-[#6B7280]">
              Showing {rangeStart}–{rangeEnd} of {total}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="as-page-btn as-body rounded-lg border border-[#E5E7EB] px-3 py-1.5 text-xs font-semibold text-[#6B7280] hover:border-[#F97316] hover:text-[#1F2937]"
              >
                Prev
              </button>
              <span className="as-body text-xs font-medium text-[#6B7280]">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="as-page-btn as-body rounded-lg border border-[#E5E7EB] px-3 py-1.5 text-xs font-semibold text-[#6B7280] hover:border-[#F97316] hover:text-[#1F2937]"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminServices;