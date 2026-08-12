import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";

const ADMIN_API = `${process.env.REACT_APP_API_URL}/api/admin/vendors`;
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

const FILTERS = ["all", "pending", "approved", "rejected"];

const AllVendors = () => {
  const { token } = useSelector((state) => state.auth || {});
  const navigate = useNavigate();

  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
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
  }, [debouncedSearch, filter]);

  const fetchVendors = async ({ status, q, pageNum } = {}) => {
    setLoading(true);
    try {
      const params = { page: pageNum || 1, limit: PAGE_SIZE };
      if (status && status !== "all") params.status = status;
      if (q) params.q = q;

      const res = await axios.get(`${ADMIN_API}/all-vendors`, {
        ...authHeaders,
        params,
      });
      setVendors(res.data.vendors || []);
      setPagination(res.data.pagination || { total: 0, totalPages: 1 });
      if (res.data.counts) setCounts(res.data.counts);
    } catch (error) {
      toast.error(error.response?.data?.msg || "Could not load vendors");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchVendors({ status: filter, q: debouncedSearch, pageNum: page });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, filter, debouncedSearch, page]);

  const goToDetails = (v) => {
    navigate(`/admin/vendors/${v._id}`, { state: { vendor: v } });
  };

  const countFor = (status) => counts[status] ?? 0;

  const { totalPages, total } = pagination;
  const rangeStart = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(page * PAGE_SIZE, total);

  return (
    <div className="av-body text-[#1F2937]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=Inter:wght@400;500;600;700&display=swap');
        .av-display { font-family: 'Sora', system-ui, sans-serif; }
        .av-body { font-family: 'Inter', system-ui, sans-serif; }
        .av-card { border-radius: 16px; }
        .av-row { transition: background-color 0.2s ease; cursor: pointer; }
        .av-row:hover { background-color: #F8FAFC; }
        .av-chip { transition: background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease; }
        .av-input { transition: border-color 0.2s ease, box-shadow 0.2s ease; }
        .av-input:focus { border-color: #F97316; box-shadow: 0 0 0 3px rgba(249,115,22,0.15); }
        .av-page-btn { transition: background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease; }
        .av-page-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        @keyframes avSpin { to { transform: rotate(360deg); } }
        .av-spin { animation: avSpin 0.8s linear infinite; }
      `}</style>

      <div>
        <h1 className="av-display text-2xl font-extrabold sm:text-3xl">Vendors</h1>
        <p className="av-body mt-1 text-sm text-[#6B7280]">
          Review, approve, and manage vendor accounts.
        </p>
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <span
              key={f}
              onClick={() => setFilter(f)}
              className={`av-chip av-body cursor-pointer rounded-full border px-4 py-1.5 text-xs font-semibold capitalize ${
                filter === f
                  ? "border-[#F97316] bg-[#F97316] text-white"
                  : "border-[#E5E7EB] text-[#6B7280] hover:border-[#F97316]"
              }`}
            >
              {f} ({countFor(f)})
            </span>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search shop, name, email…"
            className="av-input av-body w-full rounded-xl border border-[#E5E7EB] px-3.5 py-2 text-sm outline-none"
          />
          {search !== debouncedSearch && (
            <i className="fa-solid fa-circle-notch av-spin absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#F97316]"></i>
          )}
        </div>
      </div>

      <div className="av-card mt-5 border border-[#E5E7EB] bg-white">
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-14 text-sm text-[#6B7280]">
            <i className="fa-solid fa-circle-notch av-spin text-[#F97316]"></i>
            Loading vendors…
          </div>
        ) : vendors.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-14 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F8FAFC] text-[#F97316]">
              <i className="fa-solid fa-store-slash text-lg"></i>
            </span>
            <p className="av-body text-sm font-semibold">No vendors found</p>
          </div>
        ) : (
          <div className="divide-y divide-[#E5E7EB]">
            {vendors.map((v) => (
              <div
                key={v._id}
                onClick={() => goToDetails(v)}
                className="av-row flex items-center gap-3 px-5 py-4"
              >
                {v.image ? (
                  <img
                    src={getImageUrl(v.image)}
                    alt=""
                    className="h-11 w-11 shrink-0 rounded-full object-cover"
                  />
                ) : (
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#F8FAFC] text-[#F97316]">
                    <i className="fa-solid fa-store text-sm"></i>
                  </span>
                )}

                <div className="min-w-0 flex-1">
                  <p className="av-body truncate text-sm font-semibold">
                    {v.shop_name || v.name}
                  </p>
                  <p className="av-body truncate text-xs text-[#6B7280]">{v.email}</p>
                </div>

                <p className="av-body hidden shrink-0 text-xs font-medium text-[#6B7280] sm:block">
                  {v.phone || "—"}
                </p>

                <span
                  className={`av-chip av-body shrink-0 rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                    v.approvalStatus === "approved"
                      ? "bg-green-50 text-green-600"
                      : v.approvalStatus === "rejected"
                      ? "bg-red-50 text-red-500"
                      : "bg-yellow-50 text-yellow-600"
                  }`}
                >
                  {v.approvalStatus || "pending"}
                </span>

                <i className="fa-solid fa-chevron-right shrink-0 text-xs text-[#9CA3AF]"></i>
              </div>
            ))}
          </div>
        )}

        {!loading && total > 0 && (
          <div className="flex flex-col items-center justify-between gap-3 border-t border-[#E5E7EB] px-5 py-3.5 sm:flex-row">
            <p className="av-body text-xs text-[#6B7280]">
              Showing {rangeStart}–{rangeEnd} of {total}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="av-page-btn av-body rounded-lg border border-[#E5E7EB] px-3 py-1.5 text-xs font-semibold text-[#6B7280] hover:border-[#F97316] hover:text-[#1F2937]"
              >
                Prev
              </button>
              <span className="av-body text-xs font-medium text-[#6B7280]">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="av-page-btn av-body rounded-lg border border-[#E5E7EB] px-3 py-1.5 text-xs font-semibold text-[#6B7280] hover:border-[#F97316] hover:text-[#1F2937]"
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

export default AllVendors;