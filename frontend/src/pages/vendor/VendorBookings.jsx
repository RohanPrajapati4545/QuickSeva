import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const BOOKING_API = `${process.env.REACT_APP_API_URL}/api/vendor-booking`;
const BASE_URL = process.env.REACT_APP_API_URL;
const SEARCH_DEBOUNCE_MS = 400;

const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (/^https?:\/\//i.test(imagePath)) return imagePath;
  const cleanBase = BASE_URL?.replace(/\/$/, "") || "";
  const cleanPath = imagePath.replace(/^\//, "");
  return `${cleanBase}/${cleanPath}`;
};

const STATUS_OPTIONS = ["pending", "confirmed", "completed", "cancelled"];

const STATUS_STYLES = {
  pending: "bg-yellow-50 text-yellow-600",
  confirmed: "bg-blue-50 text-blue-600",
  completed: "bg-green-50 text-green-600",
  cancelled: "bg-red-50 text-red-500",
};

const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  try {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
};

const VendorBookings = () => {
  const { token } = useSelector((state) => state.auth || {});
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
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

  // Only `q` goes to the backend. Status stays client-side and is filtered
  // from this same search-matched list, so every status chip's count is
  // always correct — never a stale/zero count from a narrower fetch.
  const fetchBookings = async ({ q } = {}) => {
    setLoading(true);
    try {
      const params = {};
      if (q) params.q = q;

      const res = await axios.get(`${BOOKING_API}/all-bookings`, {
        ...authHeaders,
        params,
      });
      setBookings(res.data.bookings || []);
    } catch (error) {
      toast.error(error.response?.data?.msg || "Could not load bookings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchBookings({ q: debouncedSearch });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, debouncedSearch]);

  const goToDetails = (booking) => {
    navigate(`/vendor/bookings/${booking._id}`, { state: { booking } });
  };

  const filteredBookings =
    statusFilter === "all" ? bookings : bookings.filter((b) => b.status === statusFilter);

  return (
    <div className="vb-body text-[#1F2937]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=Inter:wght@400;500;600;700&display=swap');
        .vb-display { font-family: 'Sora', system-ui, sans-serif; }
        .vb-body { font-family: 'Inter', system-ui, sans-serif; }
        .vb-card { border-radius: 16px; transition: box-shadow 0.25s ease; }
        .vb-row { transition: background-color 0.2s ease; cursor: pointer; }
        .vb-row:hover { background-color: #F8FAFC; }
        .vb-chip { transition: background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease; }
        .vb-input { transition: border-color 0.2s ease, box-shadow 0.2s ease; }
        .vb-input:focus { border-color: #F97316; box-shadow: 0 0 0 3px rgba(249,115,22,0.15); }
        @keyframes vbSpin { to { transform: rotate(360deg); } }
        .vb-spin { animation: vbSpin 0.8s linear infinite; }
      `}</style>

      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="vb-display text-2xl font-extrabold sm:text-3xl">Bookings</h1>
          <p className="vb-body mt-1 text-sm text-[#6B7280]">
            Manage booking requests from your customers.
          </p>
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          <span
            onClick={() => setStatusFilter("all")}
            className={`vb-chip vb-body cursor-pointer rounded-full border px-4 py-1.5 text-xs font-semibold ${
              statusFilter === "all"
                ? "border-[#F97316] bg-[#F97316] text-white"
                : "border-[#E5E7EB] text-[#6B7280] hover:border-[#F97316]"
            }`}
          >
            All ({bookings.length})
          </span>
          {STATUS_OPTIONS.map((s) => (
            <span
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`vb-chip vb-body cursor-pointer rounded-full border px-4 py-1.5 text-xs font-semibold capitalize ${
                statusFilter === s
                  ? "border-[#F97316] bg-[#F97316] text-white"
                  : "border-[#E5E7EB] text-[#6B7280] hover:border-[#F97316]"
              }`}
            >
              {s} ({bookings.filter((b) => b.status === s).length})
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
            className="vb-input vb-body w-full rounded-xl border border-[#E5E7EB] py-2 pl-9 pr-9 text-sm outline-none"
          />
          {search !== debouncedSearch && (
            <i className="fa-solid fa-circle-notch vb-spin absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#F97316]"></i>
          )}
        </div>
      </div>

      <div className="vb-card mt-5 border border-[#E5E7EB] bg-white">
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-14 text-sm text-[#6B7280]">
            <i className="fa-solid fa-circle-notch vb-spin text-[#F97316]"></i>
            Loading bookings…
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-14 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F8FAFC] text-[#F97316]">
              <i className="fa-solid fa-calendar-xmark text-lg"></i>
            </span>
            <div>
              <p className="vb-body text-sm font-semibold">No bookings found</p>
              <p className="vb-body mt-0.5 text-xs text-[#6B7280]">
                {debouncedSearch
                  ? "Try a different search term."
                  : statusFilter === "all"
                  ? "You haven't received any bookings yet."
                  : `No ${statusFilter} bookings right now.`}
              </p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-[#E5E7EB]">
            {filteredBookings.map((b) => (
              <div
                key={b._id}
                onClick={() => goToDetails(b)}
                className="vb-row flex items-center gap-3 px-5 py-4"
              >
                {b.service?.image ? (
                  <img
                    src={getImageUrl(b.service.image)}
                    alt=""
                    className="h-11 w-11 shrink-0 rounded-xl object-cover"
                  />
                ) : (
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#F8FAFC] text-[#F97316]">
                    <i className="fa-solid fa-tags text-sm"></i>
                  </span>
                )}

                <div className="min-w-0 flex-1">
                  <p className="vb-body truncate text-sm font-semibold">
                    {b.service?.service_name || "Service removed"}
                  </p>
                  <p className="vb-body truncate text-xs text-[#6B7280]">{b.customer_name}</p>
                </div>

                <p className="vb-body hidden shrink-0 text-xs font-medium text-[#6B7280] sm:block">
                  {formatDate(b.booking_date)}
                </p>

                <span
                  className={`vb-chip vb-body shrink-0 rounded-full px-3 py-1 text-xs font-semibold capitalize ${STATUS_STYLES[b.status] || "bg-gray-100 text-gray-500"}`}
                >
                  {b.status}
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

export default VendorBookings;