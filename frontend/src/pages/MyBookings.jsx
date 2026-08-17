import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

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
  pending: { label: "Pending", bg: "bg-amber-50", text: "text-amber-600", dot: "bg-amber-500" },
  confirmed: { label: "Confirmed", bg: "bg-blue-50", text: "text-blue-600", dot: "bg-blue-500" },
  completed: { label: "Completed", bg: "bg-emerald-50", text: "text-emerald-600", dot: "bg-emerald-500" },
  cancelled: { label: "Cancelled", bg: "bg-rose-50", text: "text-rose-600", dot: "bg-rose-500" },
};

function StarPicker({ value, onChange }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex items-center gap-1.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
          className="text-2xl leading-none transition-transform hover:scale-110"
          aria-label={`${n} star`}
        >
          <i
            className={`fa-solid fa-star ${
              (hover || value) >= n ? "text-[#F97316]" : "text-[#E5E7EB]"
            }`}
          ></i>
        </button>
      ))}
    </div>
  );
}

function ReviewModal({ booking, onClose, onSubmitted }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { token } = useSelector((state) => state.auth || {});

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating) {
      toast.error("Please select a star rating");
      return;
    }
    setSubmitting(true);
    try {
      await axios.post(
        `${USER_API}/booking/${booking._id}/review`,
        { rating, comment },
        { headers: token ? { Authorization: `Bearer ${token}` } : undefined }
      );
      toast.success("Thanks for your review!");
      onSubmitted(booking._id);
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.msg || "Could not submit review");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1F2937]/50 px-4" onClick={onClose}>
      <div
        className="mb-body w-full max-w-sm rounded-2xl bg-white p-5 shadow-[0_24px_60px_-24px_rgba(31,41,55,0.4)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="mb-display text-lg font-extrabold text-[#1F2937]">Rate your experience</h3>
          <i className="fa-solid fa-xmark cursor-pointer text-[#9CA3AF]" onClick={onClose}></i>
        </div>
        <p className="mt-1 text-xs text-[#6B7280]">{booking.service?.service_name}</p>

        <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-4">
          <div className="flex justify-center">
            <StarPicker value={rating} onChange={setRating} />
          </div>

          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Tell others how the service went (optional)"
            rows={3}
            maxLength={500}
            className="mb-input w-full resize-none rounded-xl border border-[#E5E7EB] px-3.5 py-2.5 text-sm outline-none"
          />

          <button
            type="submit"
            disabled={submitting}
            className="mb-cta-primary flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white"
          >
            {submitting ? (
              <>
                <i className="fa-solid fa-circle-notch mb-spin"></i>
                Submitting…
              </>
            ) : (
              "Submit review"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

const MyBookings = () => {
  const navigate = useNavigate();
  const { token } = useSelector((state) => state.auth || {});

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewTarget, setReviewTarget] = useState(null);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${USER_API}/my-bookings`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      setBookings(res.data.bookings || []);
    } catch (error) {
      toast.error(error.response?.data?.msg || "Could not load bookings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCancel = (booking) => {
    Swal.fire({
      title: "Cancel booking?",
      text: "This can't be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, cancel it",
      confirmButtonColor: "#F97316",
    }).then(async (result) => {
      if (!result.isConfirmed) return;
      try {
        await axios.put(`${USER_API}/cancel-booking/${booking._id}`, null, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        toast.success("Booking cancelled");
        setBookings((prev) =>
          prev.map((b) => (b._id === booking._id ? { ...b, status: "cancelled" } : b))
        );
      } catch (error) {
        toast.error(error.response?.data?.msg || "Could not cancel booking");
      }
    });
  };

  const handleReviewed = (bookingId) => {
    setBookings((prev) =>
      prev.map((b) => (b._id === bookingId ? { ...b, hasReview: true } : b))
    );
  };

  return (
    <div className="mb-body min-h-screen bg-[#F8FAFC] text-[#1F2937]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=Inter:wght@400;500;600;700&display=swap');
        .mb-display { font-family: 'Sora', system-ui, sans-serif; }
        .mb-body { font-family: 'Inter', system-ui, sans-serif; }
        .mb-card { border-radius: 18px; transition: box-shadow 0.25s ease, transform 0.25s ease; }
        .mb-card:hover { box-shadow: 0 20px 40px -26px rgba(31,41,55,0.2); }
        .mb-input { transition: border-color 0.2s ease, box-shadow 0.2s ease; }
        .mb-input:focus { border-color: #F97316; box-shadow: 0 0 0 3px rgba(249,115,22,0.15); }
        .mb-cta-primary { background-color: #F97316; transition: background-color 0.2s ease; }
        .mb-cta-primary:hover { background-color: #EA580C; }
        .mb-btn-outline { transition: border-color 0.2s ease, color 0.2s ease, background-color 0.2s ease; }
        @keyframes mbSpin { to { transform: rotate(360deg); } }
        .mb-spin { animation: mbSpin 0.8s linear infinite; }
      `}</style>

      <section className="bg-[#1F2937] px-4 py-10 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <h1 className="mb-display text-2xl font-extrabold text-white sm:text-3xl">My Bookings</h1>
          <p className="mt-1.5 text-sm text-white/60">Track your service requests and share feedback.</p>
        </div>
      </section>

      <section className="px-4 py-10 sm:px-6">
        <div className="mx-auto max-w-5xl">
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-20 text-sm text-[#6B7280]">
              <i className="fa-solid fa-circle-notch mb-spin text-[#F97316]"></i>
              Loading your bookings…
            </div>
          ) : bookings.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-[#F97316] shadow-sm">
                <i className="fa-solid fa-calendar-xmark text-xl"></i>
              </span>
              <div>
                <p className="text-sm font-semibold">No bookings yet</p>
                <p className="mt-0.5 text-xs text-[#6B7280]">Book a service to see it here.</p>
              </div>
              <button
                onClick={() => navigate("/services")}
                className="mb-cta-primary mt-2 rounded-xl px-5 py-2.5 text-xs font-semibold text-white"
              >
                Browse services
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {bookings.map((b) => {
                const statusStyle = STATUS_STYLES[b.status] || STATUS_STYLES.pending;
                const canCancel = b.status === "pending" || b.status === "confirmed";
                const canReview = b.status === "completed" && !b.hasReview;

                return (
                  <div key={b._id} className="mb-card border border-[#E5E7EB] bg-white p-4 sm:p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        {b.service?.image ? (
                          <img
                            src={getImageUrl(b.service.image)}
                            alt=""
                            className="h-14 w-14 shrink-0 rounded-xl object-cover"
                          />
                        ) : (
                          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[#F8FAFC] text-[#F97316]">
                            <i className="fa-solid fa-toolbox text-lg"></i>
                          </span>
                        )}
                        <div className="min-w-0">
                          <h3 className="mb-display truncate text-sm font-bold">
                            {b.service?.service_name || "Service"}
                          </h3>
                          <p className="mt-0.5 truncate text-xs text-[#6B7280]">
                            {b.vendor?.shop_name || b.vendor?.name}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`flex shrink-0 items-center gap-1.5 rounded-full ${statusStyle.bg} px-3 py-1 text-[11px] font-semibold ${statusStyle.text}`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${statusStyle.dot}`}></span>
                        {statusStyle.label}
                      </span>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3 border-t border-[#F1F5F9] pt-4 text-xs sm:grid-cols-4">
                      <div>
                        <p className="text-[#9CA3AF]">Date</p>
                        <p className="mt-0.5 font-medium">
                          {new Date(b.booking_date).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                      {b.booking_time && (
                        <div>
                          <p className="text-[#9CA3AF]">Time</p>
                          <p className="mt-0.5 font-medium">{b.booking_time}</p>
                        </div>
                      )}
                      <div>
                        <p className="text-[#9CA3AF]">Price</p>
                        <p className="mt-0.5 font-semibold text-[#F97316]">₹{b.service?.price}</p>
                      </div>
                      <div className="col-span-2 sm:col-span-1">
                        <p className="text-[#9CA3AF]">Address</p>
                        <p className="mt-0.5 truncate font-medium">{b.address}</p>
                      </div>
                    </div>

                    {(canCancel || b.status === "completed") && (
                      <div className="mt-4 flex items-center justify-end gap-2 border-t border-[#F1F5F9] pt-4">
                        {canCancel && (
                          <button
                            onClick={() => handleCancel(b)}
                            className="mb-btn-outline rounded-xl border border-[#E5E7EB] px-4 py-2 text-xs font-semibold text-[#6B7280] hover:border-rose-400 hover:text-rose-500"
                          >
                            Cancel booking
                          </button>
                        )}
                        {b.status === "completed" && !canReview && (
                          <span className="flex items-center gap-1.5 rounded-xl bg-[#F8FAFC] px-4 py-2 text-xs font-semibold text-[#6B7280]">
                            <i className="fa-solid fa-check text-emerald-500"></i>
                            Reviewed
                          </span>
                        )}
                        {canReview && (
                          <button
                            onClick={() => setReviewTarget(b)}
                            className="mb-cta-primary flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold text-white"
                          >
                            <i className="fa-solid fa-star"></i>
                            Add review
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {reviewTarget && (
        <ReviewModal
          booking={reviewTarget}
          onClose={() => setReviewTarget(null)}
          onSubmitted={handleReviewed}
        />
      )}
    </div>
  );
};

export default MyBookings;