import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";

const BOOKING_API = `${process.env.REACT_APP_API_URL}/api/admin/bookings`;
const VENDOR_API = `${process.env.REACT_APP_API_URL}/api/admin/vendors`;
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
  confirmed: "bg-blue-50 text-blue-600",
  completed: "bg-green-50 text-green-600",
  cancelled: "bg-red-50 text-red-500",
};

const FILTERS = ["all", "pending", "confirmed", "completed", "cancelled"];

const formatDate = (d) => {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "—";
  }
};

const AdminVendorBookings = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { token } = useSelector((state) => state.auth || {});

  const vendorFromState = location.state?.vendor || null;
  const [vendor, setVendor] = useState(vendorFromState);

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });
  const [counts, setCounts] = useState({
    all: 0,
    pending: 0,
    confirmed: 0,
    completed: 0,
    cancelled: 0,
  });

  const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, statusFilter]);

  // Vendor header info — if it wasn't handed over via navigation state
  // (e.g. page was opened directly / refreshed), fetch it once.
  useEffect(() => {
    if (vendor || !token) return;
    axios
      .get(`${VENDOR_API}/vendor/${id}`, authHeaders)
      .then((res) => setVendor(res.data.vendor || null))
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, token]);

  // Only bookings placed against THIS vendor's services are fetched —
  // scoped server-side via the `vendor` param, not just filtered client-side.
  const fetchBookings = async ({ status, q, pageNum } = {}) => {
    setLoading(true);
    try {
      const params = { vendor: id, page: pageNum || 1, limit: PAGE_SIZE };
      if (status && status !== "all") params.status = status;
      if (q) params.q = q;

      const res = await axios.get(`${BOOKING_API}/all-bookings`, {
        ...authHeaders,
        params,
      });
      setBookings(res.data.bookings || []);
      setPagination(res.data.pagination || { total: 0, totalPages: 1 });
      if (res.data.counts) setCounts(res.data.counts);
    } catch (error) {
      toast.error(error.response?.data?.msg || "Could not load bookings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchBookings({ status: statusFilter, q: debouncedSearch, pageNum: page });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, id, statusFilter, debouncedSearch, page]);

  const countFor = (status) => counts[status] ?? 0;

  const { totalPages, total } = pagination;
  const rangeStart = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(page * PAGE_SIZE, total);

  const vendorLabel = vendor?.shop_name || vendor?.name || "Vendor";

  return (
    <div className="avb-body min-h-screen bg-[#F8FAFC] text-[#1F2937]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=Inter:wght@400;500;600;700&display=swap');
        .avb-display { font-family: 'Sora', system-ui, sans-serif; }
        .avb-body { font-family: 'Inter', system-ui, sans-serif; }
        .avb-card { border-radius: 16px; }
        .avb-row { transition: background-color 0.2s ease; }
        .avb-row:hover { background-color: #F8FAFC; }
        .avb-chip { transition: background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease; }
        .avb-input { transition: border-color 0.2s ease, box-shadow 0.2s ease; }
        .avb-input:focus { border-color: #F97316; box-shadow: 0 0 0 3px rgba(249,115,22,0.15); }
        .avb-page-btn { transition: background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease; }
        .avb-page-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .avb-back-btn { transition: background-color 0.2s ease, color 0.2s ease; }
        @keyframes avbSpin { to { transform: rotate(360deg); } }
        .avb-spin { animation: avbSpin 0.8s linear infinite; }
      `}</style>

      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <h1 className="avb-display text-xl font-extrabold sm:text-2xl">
              Bookings · {vendorLabel}
            </h1>
            <p className="avb-body mt-0.5 text-sm text-[#6B7280]">
              Services this vendor's customers have actually booked.
            </p>
          </div>
          <button
            onClick={() => navigate(`/admin/vendors/${id}`)}
            className="avb-back-btn avb-body flex shrink-0 items-center gap-2 rounded-full bg-white px-3.5 py-2 text-xs font-semibold text-[#6B7280] shadow-sm hover:bg-[#F97316]/10 hover:text-[#F97316]"
          >
            <i className="fa-solid fa-arrow-left"></i>
            Back to vendor
          </button>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            {FILTERS.map((f) => (
              <span
                key={f}
                onClick={() => setStatusFilter(f)}
                className={`avb-chip avb-body cursor-pointer rounded-full border px-4 py-1.5 text-xs font-semibold capitalize ${
                  statusFilter === f
                    ? "border-[#F97316] bg-[#F97316] text-white"
                    : "border-[#E5E7EB] text-[#6B7280] hover:border-[#F97316]"
                }`}
              >
                {f} ({countFor(f)})
              </span>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-[#9CA3AF]"></i>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search customer, service…"
              className="avb-input avb-body w-full rounded-xl border border-[#E5E7EB] py-2 pl-9 pr-9 text-sm outline-none"
            />
            {search !== debouncedSearch && (
              <i className="fa-solid fa-circle-notch avb-spin absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#F97316]"></i>
            )}
          </div>
        </div>

        <div className="avb-card mt-5 border border-[#E5E7EB] bg-white">
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-14 text-sm text-[#6B7280]">
              <i className="fa-solid fa-circle-notch avb-spin text-[#F97316]"></i>
              Loading bookings…
            </div>
          ) : bookings.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-14 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F8FAFC] text-[#F97316]">
                <i className="fa-solid fa-calendar-xmark text-lg"></i>
              </span>
              <div>
                <p className="avb-body text-sm font-semibold">No bookings found</p>
                <p className="avb-body mt-0.5 text-xs text-[#6B7280]">
                  {debouncedSearch
                    ? "Try a different search term."
                    : statusFilter === "all"
                    ? "This vendor has no bookings yet."
                    : `No ${statusFilter} bookings right now.`}
                </p>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-[#E5E7EB]">
              {bookings.map((b) => (
                <div key={b._id} className="avb-row flex items-center gap-3 px-5 py-4">
                  {b.service?.image ? (
                    <img
                      src={getImageUrl(b.service.image)}
                      alt=""
                      className="h-11 w-11 shrink-0 rounded-xl object-cover"
                    />
                  ) : (
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#F8FAFC] text-[#F97316]">
                      <i className="fa-solid fa-calendar-check text-sm"></i>
                    </span>
                  )}

                  <div className="min-w-0 flex-1">
                    <p className="avb-body truncate text-sm font-semibold">
                      {b.service?.service_name || "—"}
                    </p>
                    <p className="avb-body truncate text-xs text-[#6B7280]">
                      {b.customer?.name || b.customer?.email || "—"} · {formatDate(b.bookingDate || b.date || b.createdAt)}
                    </p>
                  </div>

                  <p className="avb-body hidden shrink-0 text-sm font-bold text-[#F97316] sm:block">
                    ₹{b.amount ?? b.price ?? "—"}
                  </p>

                  <span
                    className={`avb-chip avb-body shrink-0 rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                      STATUS_STYLES[b.status || "pending"]
                    }`}
                  >
                    {b.status || "pending"}
                  </span>
                </div>
              ))}
            </div>
          )}

          {!loading && total > 0 && (
            <div className="flex flex-col items-center justify-between gap-3 border-t border-[#E5E7EB] px-5 py-3.5 sm:flex-row">
              <p className="avb-body text-xs text-[#6B7280]">
                Showing {rangeStart}–{rangeEnd} of {total}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="avb-page-btn avb-body rounded-lg border border-[#E5E7EB] px-3 py-1.5 text-xs font-semibold text-[#6B7280] hover:border-[#F97316] hover:text-[#1F2937]"
                >
                  Prev
                </button>
                <span className="avb-body text-xs font-medium text-[#6B7280]">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="avb-page-btn avb-body rounded-lg border border-[#E5E7EB] px-3 py-1.5 text-xs font-semibold text-[#6B7280] hover:border-[#F97316] hover:text-[#1F2937]"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminVendorBookings;