import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";

const PROFILE_API = `${process.env.REACT_APP_API_URL}/api/vendor-profile`;
const BASE_URL = process.env.REACT_APP_API_URL;

const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (/^https?:\/\//i.test(imagePath)) return imagePath;
  const cleanBase = BASE_URL?.replace(/\/$/, "") || "";
  const cleanPath = imagePath.replace(/^\//, "");
  return `${cleanBase}/${cleanPath}`;
};

// Same star-row used across the customer-facing pages (SingleService.jsx,
// Home.jsx) so the rating visuals stay consistent across the app.
function StarRow({ value = 0, size = "text-sm" }) {
  return (
    <div className={`relative inline-flex ${size} leading-none`}>
      <div className="flex gap-0.5 text-[#E5E7EB]">
        {Array.from({ length: 5 }).map((_, i) => (
          <i key={i} className="fa-solid fa-star"></i>
        ))}
      </div>
      <div
        className="absolute inset-0 flex gap-0.5 overflow-hidden text-[#F97316]"
        style={{ width: `${Math.max(0, Math.min(5, value)) * 20}%` }}
      >
        {Array.from({ length: 5 }).map((_, i) => (
          <i key={i} className="fa-solid fa-star"></i>
        ))}
      </div>
    </div>
  );
}

// Simple 1–5 distribution bars next to the summary — purely derived from
// the reviews already fetched, no extra API call.
function RatingBreakdown({ reviews }) {
  const total = reviews.length;
  const counts = [5, 4, 3, 2, 1].map(
    (star) => reviews.filter((r) => Math.round(r.rating) === star).length
  );

  return (
    <div className="flex flex-col gap-1.5">
      {[5, 4, 3, 2, 1].map((star, i) => {
        const count = counts[i];
        const pct = total ? Math.round((count / total) * 100) : 0;
        return (
          <div key={star} className="flex items-center gap-2 text-xs text-[#6B7280]">
            <span className="vr-body w-8 shrink-0 font-semibold text-[#1F2937]">{star}★</span>
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#F1F5F9]">
              <div
                className="h-full rounded-full bg-[#F97316]"
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="w-6 shrink-0 text-right">{count}</span>
          </div>
        );
      })}
    </div>
  );
}

const VendorReviews = () => {
  const { token } = useSelector((state) => state.auth || {});
  const navigate = useNavigate();

  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [loading, setLoading] = useState(true);
  const [ratingFilter, setRatingFilter] = useState("all");

  useEffect(() => {
    const fetchReviews = async () => {
      if (!token) return;
      setLoading(true);
      try {
        const res = await axios.get(`${PROFILE_API}/reviews`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setReviews(res.data.reviews || []);
        setAvgRating(res.data.avgRating || 0);
        setTotalReviews(res.data.totalReviews || 0);
      } catch (error) {
        toast.error(error.response?.data?.msg || "Could not load reviews");
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, [token]);

  const filteredReviews =
    ratingFilter === "all"
      ? reviews
      : reviews.filter((r) => Math.round(r.rating) === Number(ratingFilter));

  return (
    <div className="vr-body text-[#1F2937]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=Inter:wght@400;500;600;700&display=swap');
        .vr-display { font-family: 'Sora', system-ui, sans-serif; }
        .vr-body { font-family: 'Inter', system-ui, sans-serif; }
        .vr-card { border-radius: 16px; }
        .vr-chip { transition: background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease; }
        .vr-back-btn { transition: background-color 0.2s ease, color 0.2s ease; }
        @keyframes vrSpin { to { transform: rotate(360deg); } }
        .vr-spin { animation: vrSpin 0.8s linear infinite; }
      `}</style>

      <button
        onClick={() => navigate(-1)}
        className="vr-back-btn vr-body mb-5 flex items-center gap-2 rounded-full bg-white px-3.5 py-2 text-xs font-semibold text-[#6B7280] shadow-sm hover:bg-[#F97316]/10 hover:text-[#F97316]"
      >
        <i className="fa-solid fa-arrow-left"></i>
        Back
      </button>

      <div>
        <h1 className="vr-display text-2xl font-extrabold sm:text-3xl">Reviews &amp; ratings</h1>
        <p className="vr-body mt-1 text-sm text-[#6B7280]">
          Everything customers have said about your services.
        </p>
      </div>

      {loading ? (
        <div className="mt-8 flex items-center justify-center gap-2 py-14 text-sm text-[#6B7280]">
          <i className="fa-solid fa-circle-notch vr-spin text-[#F97316]"></i>
          Loading reviews…
        </div>
      ) : totalReviews === 0 ? (
        <div className="vr-card mt-6 flex flex-col items-center justify-center gap-3 border border-[#E5E7EB] bg-white px-6 py-16 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F8FAFC] text-2xl text-[#F97316]">
            <i className="fa-regular fa-star"></i>
          </span>
          <div className="max-w-sm">
            <p className="vr-display text-base font-bold text-[#1F2937]">No reviews yet</p>
            <p className="vr-body mt-1.5 text-sm text-[#6B7280]">
              Once customers rate a completed booking, their reviews will show up here.
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* Summary card */}
          <div className="vr-card mt-6 grid grid-cols-1 gap-6 border border-[#E5E7EB] bg-white p-5 sm:grid-cols-[auto_1fr] sm:p-6">
            <div className="flex flex-col items-center justify-center gap-1 border-b border-[#F1F5F9] pb-5 sm:border-b-0 sm:border-r sm:pb-0 sm:pr-6">
              <span className="vr-display text-4xl font-extrabold text-[#1F2937]">
                {avgRating.toFixed(1)}
              </span>
              <StarRow value={avgRating} size="text-base" />
              <span className="vr-body mt-1 text-xs text-[#6B7280]">
                {totalReviews} review{totalReviews !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="flex items-center">
              <RatingBreakdown reviews={reviews} />
            </div>
          </div>

          {/* Filter chips */}
          <div className="mt-5 flex flex-wrap gap-2">
            <span
              onClick={() => setRatingFilter("all")}
              className={`vr-chip vr-body cursor-pointer rounded-full border px-4 py-1.5 text-xs font-semibold ${
                ratingFilter === "all"
                  ? "border-[#F97316] bg-[#F97316] text-white"
                  : "border-[#E5E7EB] text-[#6B7280] hover:border-[#F97316]"
              }`}
            >
              All ({totalReviews})
            </span>
            {[5, 4, 3, 2, 1].map((star) => {
              const count = reviews.filter((r) => Math.round(r.rating) === star).length;
              return (
                <span
                  key={star}
                  onClick={() => setRatingFilter(String(star))}
                  className={`vr-chip vr-body cursor-pointer rounded-full border px-4 py-1.5 text-xs font-semibold ${
                    ratingFilter === String(star)
                      ? "border-[#F97316] bg-[#F97316] text-white"
                      : "border-[#E5E7EB] text-[#6B7280] hover:border-[#F97316]"
                  }`}
                >
                  {star}★ ({count})
                </span>
              );
            })}
          </div>

          {/* Reviews list */}
          <div className="vr-card mt-5 divide-y divide-[#F1F5F9] border border-[#E5E7EB] bg-white">
            {filteredReviews.length === 0 ? (
              <p className="vr-body px-5 py-10 text-center text-sm text-[#6B7280]">
                No reviews with this rating.
              </p>
            ) : (
              filteredReviews.map((r) => {
                const avatarUrl = getImageUrl(r.user?.image);
                const initial = (r.user?.name || "U").charAt(0).toUpperCase();
                return (
                  <div key={r._id} className="flex gap-3 px-5 py-4 sm:px-6">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt=""
                        className="h-10 w-10 shrink-0 rounded-full object-cover"
                      />
                    ) : (
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F97316]/15 text-sm font-bold text-[#F97316]">
                        {initial}
                      </span>
                    )}

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                        <p className="vr-body truncate text-sm font-semibold">
                          {r.user?.name || "Customer"}
                        </p>
                        <span className="vr-body text-[11px] text-[#9CA3AF]">
                          {r.createdAt &&
                            new Date(r.createdAt).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                        </span>
                      </div>

                      <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1">
                        <StarRow value={r.rating} size="text-xs" />
                        {r.service?.service_name && (
                          <span className="vr-body inline-flex items-center gap-1 rounded-full bg-[#F8FAFC] px-2 py-0.5 text-[11px] font-medium text-[#6B7280]">
                            <i className="fa-solid fa-tags text-[10px] text-[#F97316]"></i>
                            {r.service.service_name}
                          </span>
                        )}
                      </div>

                      {r.comment && (
                        <p className="vr-body mt-2 text-sm leading-relaxed text-[#374151]">
                          {r.comment}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default VendorReviews;