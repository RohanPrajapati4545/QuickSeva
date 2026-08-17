import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";

const USER_API = `${process.env.REACT_APP_API_URL}/api/user`;
const BASE_URL = process.env.REACT_APP_API_URL;

const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (/^https?:\/\//i.test(imagePath)) return imagePath;
  const cleanBase = BASE_URL?.replace(/\/$/, "") || "";
  const cleanPath = imagePath.replace(/^\//, "");
  return `${cleanBase}/${cleanPath}`;
};

// Services can come back with the photo under a few different keys
// depending on which endpoint populated them — normalize here so a
// missing/renamed field never breaks the card (falls back to an icon tile).
const getServiceImageUrl = (s) => {
  const raw = s?.image || s?.service_image || s?.photo || s?.images?.[0];
  return getImageUrl(raw);
};

// Compact star row for cards — filled up to `value` (supports decimals like
// 4.3 via a width-clipped overlay so it's not just rounded to a whole star).
function StarRow({ value = 0, size = "text-[11px]" }) {
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

// Service thumbnail — a real photo if one exists, otherwise a soft
// gradient tile with the category icon centered, so cards never look
// empty even before vendors have uploaded photos.
function ServiceThumb({ service, className = "" }) {
  const imgUrl = getServiceImageUrl(service);
  return (
    <div className={`vdt-thumb relative overflow-hidden bg-[#FFF1E6] ${className}`}>
      {imgUrl ? (
        <img
          src={imgUrl}
          alt={service.service_name || ""}
          className="vdt-thumb-img h-full w-full object-cover"
          onError={(e) => {
            e.currentTarget.style.display = "none";
            e.currentTarget.nextSibling.style.display = "flex";
          }}
        />
      ) : null}
      <div
        className="vdt-thumb-fallback flex h-full w-full items-center justify-center bg-gradient-to-br from-[#FFEDD5] to-[#FED7AA]"
        style={{ display: imgUrl ? "none" : "flex" }}
      >
        <i className={`fa-solid ${service.category?.icon || "fa-tags"} text-3xl text-[#F97316]/70`}></i>
      </div>
    </div>
  );
}

const VendorDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { user, token } = useSelector((state) => state.auth || {});
  const isLoggedIn = Boolean(user || token);

  const [vendor, setVendor] = useState(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVendor = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${USER_API}/vendor/${id}`);
        setVendor(res.data.vendor);
        setServices(res.data.services || []);
      } catch (error) {
        toast.error(error.response?.data?.msg || "Could not load vendor");
        navigate("/services");
      } finally {
        setLoading(false);
      }
    };
    fetchVendor();
  }, [id, navigate]);

  const handleServiceClick = (serviceId) => {
    if (!isLoggedIn) {
      toast.error("Please login first");
      return;
    }
    navigate(`/service/${serviceId}`);
  };

  // Overall vendor rating — weighted average across all their services'
  // review counts, so a service with 40 reviews counts more than one with 2.
  const { overallRating, totalReviewCount } = useMemo(() => {
    let weightedSum = 0;
    let count = 0;
    services.forEach((s) => {
      const rating = s.avgRating || 0;
      const reviews = s.reviewCount || 0;
      weightedSum += rating * reviews;
      count += reviews;
    });
    return {
      overallRating: count > 0 ? weightedSum / count : 0,
      totalReviewCount: count,
    };
  }, [services]);

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-24 text-sm text-[#6B7280]">
        <i className="fa-solid fa-circle-notch animate-spin text-[#F97316]"></i>
        Loading…
      </div>
    );
  }

  if (!vendor) return null;

  const avatarUrl = getImageUrl(vendor.image);
  const isApproved = vendor.approvalStatus === "approved" || vendor.approvalStatus === undefined;

  return (
    <div className="vdt-body min-h-screen bg-white text-[#1F2937]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=Inter:wght@400;500;600;700&display=swap');
        .vdt-display { font-family: 'Sora', system-ui, sans-serif; }
        .vdt-body { font-family: 'Inter', system-ui, sans-serif; }
        .vdt-card { border-radius: 16px; transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease; }
        .vdt-card:hover { transform: translateY(-3px); box-shadow: 0 20px 40px -24px rgba(31,41,55,0.2); border-color: #F97316; }
        .vdt-thumb { aspect-ratio: 16 / 10; }
        .vdt-thumb-img { transition: transform 0.4s ease; }
        .vdt-card:hover .vdt-thumb-img { transform: scale(1.06); }
        .vdt-blob { position: absolute; border-radius: 9999px; filter: blur(60px); pointer-events: none; }
        .vdt-chip { transition: background-color 0.2s ease; }
      `}</style>

      {/* Banner */}
      <section className="relative overflow-hidden bg-[#1F2937] px-4 py-14 sm:px-6">
        <div className="vdt-blob -left-16 -top-16 h-64 w-64 bg-[#F97316]/25"></div>
        <div className="vdt-blob -right-10 bottom-[-4rem] h-56 w-56 bg-white/5"></div>

        <div className="relative mx-auto flex max-w-5xl flex-col items-center gap-5 text-center sm:flex-row sm:text-left">
          {avatarUrl ? (
            <img src={avatarUrl} alt="" className="h-28 w-28 shrink-0 rounded-2xl border-4 border-[#F97316] object-cover shadow-lg" />
          ) : (
            <span className="flex h-28 w-28 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-white">
              <i className="fa-solid fa-store text-3xl"></i>
            </span>
          )}
          <div className="flex-1">
            <div className="flex flex-col items-center gap-2 sm:flex-row sm:items-center">
              <h1 className="vdt-display text-2xl font-extrabold text-white sm:text-3xl">
                {vendor.shop_name || vendor.name}
              </h1>
              {isApproved && (
                <span className="vdt-body inline-flex shrink-0 items-center gap-1 rounded-full bg-[#22C55E]/15 px-2.5 py-1 text-[11px] font-semibold text-[#4ADE80]">
                  <i className="fa-solid fa-circle-check"></i>
                  Verified
                </span>
              )}
            </div>
            <p className="vdt-body mt-1 text-sm text-white/60">{vendor.name}</p>

            {totalReviewCount > 0 && (
              <div className="mt-2 flex items-center justify-center gap-2 sm:justify-start">
                <StarRow value={overallRating} size="text-sm" />
                <span className="vdt-body text-sm font-semibold text-white">{overallRating.toFixed(1)}</span>
                <span className="vdt-body text-xs text-white/50">
                  ({totalReviewCount} review{totalReviewCount !== 1 ? "s" : ""})
                </span>
              </div>
            )}

            <div className="mt-4 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              {vendor.address && (
                <span className="vdt-body inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs text-white/80">
                  <i className="fa-solid fa-location-dot text-[#F97316]"></i>
                  {vendor.address}
                </span>
              )}
              {vendor.contact && (
                <span className="vdt-body inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs text-white/80">
                  <i className="fa-solid fa-phone text-[#F97316]"></i>
                  {vendor.contact}
                </span>
              )}
              <span className="vdt-body inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs text-white/80">
                <i className="fa-solid fa-tags text-[#F97316]"></i>
                {services.length} service{services.length !== 1 ? "s" : ""}
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-10 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <div className="flex items-center justify-between">
            <h2 className="vdt-display text-xl font-extrabold">Services offered</h2>
            {totalReviewCount > 0 && (
              <span className="vdt-body text-xs font-semibold text-[#6B7280]">
                Sorted by relevance
              </span>
            )}
          </div>

          {services.length === 0 ? (
            <div className="mt-6 flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-[#E5E7EB] py-14 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F8FAFC] text-[#F97316]">
                <i className="fa-solid fa-box-open text-lg"></i>
              </span>
              <p className="vdt-body text-sm text-[#6B7280]">This vendor hasn't listed any services yet.</p>
            </div>
          ) : (
            <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
              {services.map((s) => {
                const avgRating = s.avgRating || 0;
                const reviewCount = s.reviewCount || 0;
                return (
                  <div
                    key={s._id}
                    onClick={() => handleServiceClick(s._id)}
                    className="vdt-card cursor-pointer overflow-hidden border border-[#E5E7EB]"
                  >
                    <div className="relative">
                      <ServiceThumb service={s} className="w-full" />
                      <span className="vdt-display absolute right-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-xs font-extrabold text-[#1F2937] shadow-sm">
                        ₹{s.price}
                      </span>
                    </div>

                    <div className="p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h3 className="vdt-display truncate text-sm font-bold text-[#1F2937]">{s.service_name}</h3>
                          <p className="vdt-body mt-0.5 truncate text-xs text-[#6B7280]">
                            <i className={`fa-solid ${s.category?.icon || "fa-tags"} mr-1 text-[#F97316]`}></i>
                            {s.category?.category_name}
                          </p>
                        </div>
                      </div>

                      <div className="vdt-body mt-2.5 flex items-center gap-1.5">
                        <StarRow value={avgRating} />
                        {reviewCount > 0 ? (
                          <span className="text-[11px] text-[#9CA3AF]">
                            {avgRating.toFixed(1)} ({reviewCount})
                          </span>
                        ) : (
                          <span className="text-[11px] text-[#9CA3AF]">No reviews yet</span>
                        )}
                      </div>

                      {s.description && (
                        <p className="vdt-body mt-2 line-clamp-2 text-xs text-[#6B7280]">{s.description}</p>
                      )}

                      <div className="mt-3 flex items-center justify-end border-t border-[#F1F5F9] pt-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleServiceClick(s._id);
                          }}
                          className="vdt-body flex items-center gap-1.5 text-xs font-semibold text-[#F97316] hover:text-[#EA580C]"
                        >
                          See details
                          <i className="fa-solid fa-arrow-right text-[10px]"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default VendorDetails;