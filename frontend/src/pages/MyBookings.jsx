import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";

const USER_API = `${process.env.REACT_APP_API_URL}/api/user`;
const BASE_URL = process.env.REACT_APP_API_URL;

const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (/^https?:\/\//i.test(imagePath)) return imagePath;
  const cleanBase = BASE_URL?.replace(/\/$/, "") || "";
  const cleanPath = imagePath.replace(/^\//, "");
  return `${cleanBase}/${cleanPath}`;
};

const STATUS_STYLES = {
  pending: "bg-[#FEF3C7] text-[#92400E]",
  confirmed: "bg-[#DBEAFE] text-[#1E40AF]",
  completed: "bg-[#DCFCE7] text-[#166534]",
  cancelled: "bg-[#FEE2E2] text-[#991B1B]",
};

const MyBookings = () => {
  const navigate = useNavigate();
  const { user, token } = useSelector((state) => state.auth || {});
  const isLoggedIn = Boolean(user || token);

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);
  const [filter, setFilter] = useState("all");

  const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    if (!isLoggedIn) {
      toast.error("Please login first");
      navigate("/login", { state: { from: "/my-bookings" } });
      return;
    }

    const fetchBookings = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${USER_API}/my-bookings`, authHeaders);
        setBookings(res.data.bookings || []);
      } catch (error) {
        toast.error(error.response?.data?.msg || "Could not load bookings");
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn]);

  const handleCancel = async (id) => {
    setCancellingId(id);
    try {
      const res = await axios.put(`${USER_API}/cancel-booking/${id}`, {}, authHeaders);
      setBookings((prev) => prev.map((b) => (b._id === id ? res.data.booking : b)));
      toast.success("Booking cancelled");
    } catch (error) {
      toast.error(error.response?.data?.msg || "Could not cancel booking");
    } finally {
      setCancellingId(null);
    }
  };

  if (!isLoggedIn) return null;

  const filteredBookings =
    filter === "all" ? bookings : bookings.filter((b) => b.status === filter);

  const filters = ["all", "pending", "confirmed", "completed", "cancelled"];

  return (
    <div className="mb-body min-h-screen w-full bg-[#F8FAFC] text-[#1F2937]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=Inter:wght@400;500;600;700&display=swap');
        .mb-display { font-family: 'Sora', system-ui, sans-serif; }
        .mb-body { font-family: 'Inter', system-ui, sans-serif; }
        .mb-card { border-radius: 20px; transition: transform 0.2s ease, box-shadow 0.2s ease; }
        .mb-card:hover { transform: translateY(-2px); box-shadow: 0 20px 40px -28px rgba(31,41,55,0.22); }
        .mb-chip { transition: background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease; }
        @keyframes mbSpin { to { transform: rotate(360deg); } }
        .mb-spin { animation: mbSpin 0.8s linear infinite; }
      `}</style>

      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:py-12">
        <span className="mb-body text-xs font-bold uppercase tracking-[0.2em] text-[#F97316]">
          Account
        </span>
        <h1 className="mb-display mt-1 text-2xl font-extrabold sm:text-3xl">My bookings</h1>
        <p className="mb-body mt-1 text-sm text-[#6B7280]">Track and manage the services you've booked.</p>

        <div className="mt-6 flex flex-wrap gap-2">
          {filters.map((f) => (
            <span
              key={f}
              onClick={() => setFilter(f)}
              className={`mb-chip mb-body cursor-pointer rounded-full border px-4 py-1.5 text-xs font-semibold capitalize ${
                filter === f
                  ? "border-[#F97316] bg-[#F97316] text-white"
                  : "border-[#E5E7EB] text-[#6B7280] hover:border-[#F97316]"
              }`}
            >
              {f}
            </span>
          ))}
        </div>

        <div className="mt-6">
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-20 text-sm text-[#6B7280]">
              <i className="fa-solid fa-circle-notch mb-spin text-[#F97316]"></i>
              Loading bookings…
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-[#F97316]">
                <i className="fa-solid fa-calendar-xmark text-xl"></i>
              </span>
              <div>
                <p className="mb-body text-sm font-semibold">No bookings found</p>
                <p className="mb-body mt-0.5 text-xs text-[#6B7280]">
                  {filter === "all" ? "You haven't booked any service yet." : `No ${filter} bookings.`}
                </p>
              </div>
              <button
                onClick={() => navigate("/services")}
                className="mb-body mt-1 rounded-xl bg-[#F97316] px-4 py-2 text-xs font-semibold text-white hover:bg-[#EA580C]"
              >
                Browse services
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {filteredBookings.map((b) => (
                <div key={b._id} className="mb-card border border-[#E5E7EB] bg-white p-4">
                  <div className="flex items-start gap-3">
                    {b.service?.image ? (
                      <img
                        src={getImageUrl(b.service.image)}
                        alt=""
                        className="h-16 w-16 shrink-0 rounded-xl object-cover"
                      />
                    ) : (
                      <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-[#F8FAFC] text-[#F97316]">
                        <i className="fa-solid fa-toolbox text-xl"></i>
                      </span>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="mb-display truncate text-sm font-bold">
                          {b.service?.service_name || "Service"}
                        </h3>
                        <span
                          className={`mb-body shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${
                            STATUS_STYLES[b.status] || "bg-[#F1F5F9] text-[#6B7280]"
                          }`}
                        >
                          {b.status}
                        </span>
                      </div>
                      <p className="mb-body mt-0.5 text-xs text-[#6B7280]">
                        <i className="fa-solid fa-store mr-1 text-[#F97316]"></i>
                        {b.vendor?.shop_name || b.vendor?.name || "Vendor"}
                      </p>
                      {b.service?.price != null && (
                        <p className="mb-display mt-1 text-sm font-extrabold text-[#F97316]">₹{b.service.price}</p>
                      )}
                    </div>
                  </div>

                  <div className="mt-3 space-y-1.5 border-t border-[#F1F5F9] pt-3">
                    <p className="mb-body flex items-center gap-1.5 text-xs text-[#6B7280]">
                      <i className="fa-solid fa-calendar-day w-4 text-[#F97316]"></i>
                      {new Date(b.booking_date).toLocaleDateString()}
                      {b.booking_time ? ` · ${b.booking_time}` : ""}
                    </p>
                    <p className="mb-body flex items-center gap-1.5 text-xs text-[#6B7280]">
                      <i className="fa-solid fa-location-dot w-4 text-[#F97316]"></i>
                      <span className="truncate">{b.address}</span>
                    </p>
                    {b.notes && (
                      <p className="mb-body flex items-start gap-1.5 text-xs text-[#6B7280]">
                        <i className="fa-solid fa-note-sticky mt-0.5 w-4 text-[#F97316]"></i>
                        <span className="truncate">{b.notes}</span>
                      </p>
                    )}
                  </div>

                  {["pending", "confirmed"].includes(b.status) && (
                    <div className="mt-3 flex justify-end border-t border-[#F1F5F9] pt-3">
                      <button
                        onClick={() => handleCancel(b._id)}
                        disabled={cancellingId === b._id}
                        className="mb-body flex items-center gap-1.5 rounded-lg border border-[#FCA5A5] px-3 py-1.5 text-xs font-semibold text-red-500 hover:bg-red-50 disabled:opacity-60"
                      >
                        {cancellingId === b._id ? (
                          <i className="fa-solid fa-circle-notch mb-spin"></i>
                        ) : (
                          <i className="fa-solid fa-xmark"></i>
                        )}
                        Cancel booking
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyBookings;