import React, { useEffect, useState } from "react";
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

  return (
    <div className="vdt-body min-h-screen bg-white text-[#1F2937]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=Inter:wght@400;500;600;700&display=swap');
        .vdt-display { font-family: 'Sora', system-ui, sans-serif; }
        .vdt-body { font-family: 'Inter', system-ui, sans-serif; }
        .vdt-card { border-radius: 16px; transition: transform 0.25s ease, box-shadow 0.25s ease; }
        .vdt-card:hover { transform: translateY(-3px); box-shadow: 0 20px 40px -24px rgba(31,41,55,0.2); }
      `}</style>

      <section className="bg-[#1F2937] px-4 py-12 sm:px-6">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
          {avatarUrl ? (
            <img src={avatarUrl} alt="" className="h-24 w-24 rounded-full border-4 border-[#F97316] object-cover" />
          ) : (
            <span className="flex h-24 w-24 items-center justify-center rounded-full bg-white/10 text-white">
              <i className="fa-solid fa-store text-3xl"></i>
            </span>
          )}
          <div>
            <h1 className="vdt-display text-2xl font-extrabold text-white sm:text-3xl">
              {vendor.shop_name || vendor.name}
            </h1>
            <p className="vdt-body mt-1 text-sm text-white/60">{vendor.name}</p>
            {vendor.address && (
              <p className="vdt-body mt-2 flex items-center justify-center gap-1.5 text-sm text-white/70 sm:justify-start">
                <i className="fa-solid fa-location-dot text-[#F97316]"></i>
                {vendor.address}
              </p>
            )}
            {vendor.contact && (
              <p className="vdt-body mt-1 flex items-center justify-center gap-1.5 text-sm text-white/70 sm:justify-start">
                <i className="fa-solid fa-phone text-[#F97316]"></i>
                {vendor.contact}
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="px-4 py-10 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <h2 className="vdt-display text-xl font-extrabold">Services offered</h2>

          {services.length === 0 ? (
            <p className="vdt-body mt-4 text-sm text-[#6B7280]">This vendor hasn't listed any services yet.</p>
          ) : (
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {services.map((s) => {
                const avgRating = s.avgRating || 0;
                const reviewCount = s.reviewCount || 0;
                return (
                  <div
                    key={s._id}
                    onClick={() => handleServiceClick(s._id)}
                    className="vdt-card cursor-pointer border border-[#E5E7EB] p-4"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="vdt-display text-sm font-bold text-[#1F2937]">{s.service_name}</h3>
                        <p className="vdt-body mt-0.5 text-xs text-[#6B7280]">
                          <i className={`fa-solid ${s.category?.icon || "fa-tags"} mr-1 text-[#F97316]`}></i>
                          {s.category?.category_name}
                        </p>
                      </div>
                      <span className="vdt-display shrink-0 text-sm font-extrabold text-[#F97316]">₹{s.price}</span>
                    </div>

                    <div className="vdt-body mt-2 flex items-center gap-1.5">
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
                      <p className="vdt-body mt-2 text-xs text-[#6B7280]">{s.description}</p>
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