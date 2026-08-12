import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

const BOOKING_API = `${process.env.REACT_APP_API_URL}/api/vendor-booking`;
const BASE_URL = process.env.REACT_APP_API_URL;

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

const ApStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=Inter:wght@400;500;600;700&display=swap');
    .ap-display { font-family: 'Sora', system-ui, sans-serif; }
    .ap-body { font-family: 'Inter', system-ui, sans-serif; }
    .ap-card { border-radius: 24px; }
    .ap-input { transition: border-color 0.2s ease, box-shadow 0.2s ease; }
    .ap-input:focus { border-color: #F97316; box-shadow: 0 0 0 3px rgba(249,115,22,0.15); }
    .ap-cta-primary { background-color: #F97316; transition: background-color 0.2s ease, transform 0.2s ease; }
    .ap-cta-primary:hover { background-color: #EA580C; transform: translateY(-1px); }
    .ap-cta-primary:disabled { opacity: 0.6; transform: none; }
    .ap-back-btn { transition: background-color 0.2s ease, color 0.2s ease; }
    .ap-status-select { transition: border-color 0.2s ease; }
    .ap-danger-btn { transition: background-color 0.2s ease, color 0.2s ease; }
    @keyframes apSpin { to { transform: rotate(360deg); } }
    .ap-spin { animation: apSpin 0.8s linear infinite; }
  `}</style>
);

const VendorBookingDetails = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { token } = useSelector((state) => state.auth || {});

  const [booking, setBooking] = useState(location.state?.booking || null);
  const [loading, setLoading] = useState(!location.state?.booking);
  const [updating, setUpdating] = useState(false);

  const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

  const fetchBooking = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BOOKING_API}/booking/${id}`, authHeaders);
      setBooking(res.data.booking || null);
    } catch (error) {
      toast.error(error.response?.data?.msg || "Could not load booking");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!booking && token) fetchBooking();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, token]);

  const handleStatusChange = async (newStatus) => {
    if (!booking || newStatus === booking.status) return;
    setUpdating(true);
    const prevStatus = booking.status;
    setBooking((prev) => ({ ...prev, status: newStatus }));

    try {
      await axios.put(
        `${BOOKING_API}/update-status/${booking._id}`,
        { status: newStatus },
        authHeaders
      );
      toast.success("Booking status updated");
    } catch (error) {
      setBooking((prev) => ({ ...prev, status: prevStatus }));
      toast.error(error.response?.data?.msg || "Could not update status");
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    const result = await Swal.fire({
      title: `Delete booking from "${booking.customer_name}"?`,
      text: "This can't be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
      confirmButtonColor: "#DC2626",
    });
    if (!result.isConfirmed) return;

    try {
      await axios.delete(`${BOOKING_API}/delete-booking/${booking._id}`, authHeaders);
      toast.success("Booking deleted");
      navigate("/vendor/bookings");
    } catch (error) {
      toast.error(error.response?.data?.msg || "Could not delete booking");
    }
  };

  if (loading) {
    return (
      <div className="ap-body flex min-h-screen items-center justify-center gap-2 bg-[#F8FAFC] text-sm text-[#6B7280]">
        <ApStyles />
        <i className="fa-solid fa-circle-notch ap-spin text-[#F97316]"></i>
        Loading booking…
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="ap-body flex min-h-screen flex-col items-center justify-center gap-3 bg-[#F8FAFC] text-center">
        <ApStyles />
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-[#F97316]">
          <i className="fa-solid fa-triangle-exclamation text-xl"></i>
        </span>
        <p className="ap-body text-sm font-semibold">Booking not found</p>
        <button
          onClick={() => navigate("/vendor/bookings")}
          className="ap-body mt-1 rounded-xl bg-[#F97316] px-4 py-2 text-xs font-semibold text-white"
        >
          Back to bookings
        </button>
      </div>
    );
  }

  return (
    <div className="ap-body min-h-screen bg-[#F8FAFC] text-[#1F2937]">
      <ApStyles />

      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        <button
          onClick={() => navigate("/vendor/bookings")}
          className="ap-back-btn ap-body mb-5 flex items-center gap-2 rounded-full bg-white px-3.5 py-2 text-xs font-semibold text-[#6B7280] shadow-sm hover:bg-[#F97316]/10 hover:text-[#F97316]"
        >
          <i className="fa-solid fa-arrow-left"></i>
          Back
        </button>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5 lg:gap-8">
          <div className="lg:col-span-3">
            <div className="ap-card overflow-hidden border border-[#E5E7EB] bg-white shadow-[0_20px_45px_-30px_rgba(31,41,55,0.2)]">
              {booking.service?.image ? (
                <div className="relative w-full bg-[#F1F5F9]">
                  <div className="aspect-[4/3] w-full sm:aspect-[16/10]">
                    <img
                      src={getImageUrl(booking.service.image)}
                      alt={booking.service?.service_name}
                      className="h-full w-full object-contain"
                    />
                  </div>
                  <span
                    className={`ap-body absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-semibold capitalize shadow-sm ${STATUS_STYLES[booking.status] || "bg-gray-100 text-gray-500"}`}
                  >
                    {booking.status}
                  </span>
                </div>
              ) : (
                <div className="relative flex aspect-[4/3] w-full items-center justify-center bg-[#F8FAFC] text-[#F97316] sm:aspect-[16/10]">
                  <i className="fa-solid fa-tags text-6xl"></i>
                  <span
                    className={`ap-body absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-semibold capitalize shadow-sm ${STATUS_STYLES[booking.status] || "bg-gray-100 text-gray-500"}`}
                  >
                    {booking.status}
                  </span>
                </div>
              )}

              <div className="p-5 sm:p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <h1 className="ap-display text-2xl font-extrabold leading-tight sm:text-3xl">
                    {booking.service?.service_name || "Service removed"}
                  </h1>
                  <span className="ap-display shrink-0 rounded-2xl bg-[#F97316]/10 px-4 py-1.5 text-xl font-extrabold text-[#F97316]">
                    ₹{booking.service?.price ?? "—"}
                  </span>
                </div>

                <div className="mt-5 grid grid-cols-1 gap-4 border-t border-[#F1F5F9] pt-5 sm:grid-cols-2">
                  <div>
                    <p className="ap-body text-xs font-semibold uppercase tracking-wide text-[#9CA3AF]">
                      Customer
                    </p>
                    <p className="ap-body mt-1 text-sm font-semibold">{booking.customer_name}</p>
                  </div>
                  <div>
                    <p className="ap-body text-xs font-semibold uppercase tracking-wide text-[#9CA3AF]">
                      Phone
                    </p>
                    <p className="ap-body mt-1 text-sm font-semibold">
                      <i className="fa-solid fa-phone mr-2 text-[#F97316]"></i>
                      {booking.customer_phone}
                    </p>
                  </div>
                  <div>
                    <p className="ap-body text-xs font-semibold uppercase tracking-wide text-[#9CA3AF]">
                      Booking date
                    </p>
                    <p className="ap-body mt-1 text-sm font-semibold">{formatDate(booking.booking_date)}</p>
                  </div>
                  <div>
                    <p className="ap-body text-xs font-semibold uppercase tracking-wide text-[#9CA3AF]">
                      Booking time
                    </p>
                    <p className="ap-body mt-1 text-sm font-semibold">{booking.booking_time || "—"}</p>
                  </div>
                  <div className="sm:col-span-2">
                    <p className="ap-body text-xs font-semibold uppercase tracking-wide text-[#9CA3AF]">
                      Address
                    </p>
                    <p className="ap-body mt-1 text-sm font-semibold">
                      <i className="fa-solid fa-location-dot mr-2 text-[#F97316]"></i>
                      {booking.address}
                    </p>
                  </div>
                  {booking.notes && (
                    <div className="sm:col-span-2">
                      <p className="ap-body text-xs font-semibold uppercase tracking-wide text-[#9CA3AF]">
                        Notes
                      </p>
                      <p className="ap-body mt-1 text-sm text-[#4B5563]">{booking.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="ap-card sticky top-6 border border-[#E5E7EB] bg-white p-5 shadow-[0_20px_45px_-30px_rgba(31,41,55,0.25)] sm:p-6">
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#F97316]/10 text-[#F97316]">
                  <i className="fa-solid fa-clipboard-check text-sm"></i>
                </span>
                <div>
                  <h2 className="ap-display text-lg font-extrabold leading-tight">Manage booking</h2>
                  <p className="ap-body text-xs text-[#6B7280]">Update status or remove this booking</p>
                </div>
              </div>

              <div className="mt-5 flex flex-col gap-3.5">
                <div>
                  <label className="ap-body text-xs font-semibold text-[#6B7280]">Status</label>
                  <select
                    value={booking.status}
                    disabled={updating}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    className="ap-status-select ap-input ap-body mt-1.5 w-full cursor-pointer rounded-xl border border-[#E5E7EB] px-3.5 py-2.5 text-sm font-semibold capitalize outline-none"
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s} className="bg-white text-[#1F2937]">
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                {updating && (
                  <p className="ap-body flex items-center gap-2 text-xs font-semibold text-[#F97316]">
                    <i className="fa-solid fa-circle-notch ap-spin"></i>
                    Updating status…
                  </p>
                )}

                <button
                  onClick={handleDelete}
                  className="ap-danger-btn ap-body flex items-center justify-center gap-2 rounded-xl border border-[#E5E7EB] px-5 py-3 text-sm font-semibold text-[#6B7280] hover:bg-red-50 hover:text-red-500"
                >
                  <i className="fa-solid fa-trash"></i>
                  Delete booking
                </button>

                <p className="ap-body flex items-center justify-center gap-1.5 text-center text-[11px] text-[#9CA3AF]">
                  <i className="fa-solid fa-lock text-[10px]"></i>
                  Status changes are applied instantly.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorBookingDetails;