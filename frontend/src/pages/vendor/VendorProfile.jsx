import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";

// NOTE: agar aapki AuthSlice me user update karne wala action hai
// (e.g. setUser / updateUser), uska sahi naam yahan import kar lena
// taaki profile save hote hi Redux + sidebar bhi turant update ho jaye.
// import { setUser } from "./../pages/Redux/AuthSlice";

const PROFILE_API = `${process.env.REACT_APP_API_URL}/api/vendor-profile`;
const BASE_URL = process.env.REACT_APP_API_URL;

const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (/^https?:\/\//i.test(imagePath)) return imagePath;
  const cleanBase = BASE_URL?.replace(/\/$/, "") || "";
  const cleanPath = imagePath.replace(/^\//, "");
  return `${cleanBase}/${cleanPath}`;
};

// Same star-row style used across the customer-facing pages
// (SingleService.jsx, Home.jsx) so ratings look consistent everywhere.
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

// 5→1 star distribution bars, derived purely from the reviews already
// fetched — no extra API call.
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
            <span className="vp-body w-8 shrink-0 font-semibold text-[#1F2937]">{star}★</span>
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#F1F5F9]">
              <div className="h-full rounded-full bg-[#F97316]" style={{ width: `${pct}%` }} />
            </div>
            <span className="w-6 shrink-0 text-right">{count}</span>
          </div>
        );
      })}
    </div>
  );
}

const VendorProfile = () => {
 
  const { token } = useSelector((state) => state.auth || {});

  const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    shop_name: "",
    address: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [existingImage, setExistingImage] = useState("");
  const [imagePreview, setImagePreview] = useState(null);

  const [passwordForm, setPasswordForm] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [showPasswords, setShowPasswords] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  // Reviews & ratings — every review left on any of this vendor's
  // services, shown right here on the profile page.
  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [ratingFilter, setRatingFilter] = useState("all");

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${PROFILE_API}/profile`, authHeaders);
      const u = res.data.user;
      setForm({
        name: u.name || "",
        email: u.email || "",
        phone: u.phone || "",
        shop_name: u.shop_name || "",
        address: u.address || "",
      });
      setExistingImage(u.image || "");
    } catch (error) {
      toast.error(error.response?.data?.msg || "Could not load profile");
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    setReviewsLoading(true);
    try {
      const res = await axios.get(`${PROFILE_API}/reviews`, authHeaders);
      setReviews(res.data.reviews || []);
      setAvgRating(res.data.avgRating || 0);
      setTotalReviews(res.data.totalReviews || 0);
    } catch (error) {
      toast.error(error.response?.data?.msg || "Could not load reviews");
    } finally {
      setReviewsLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchProfile();
      fetchReviews();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0] || null;
    setImageFile(file);
    setImagePreview(file ? URL.createObjectURL(file) : null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error("Name is required");

    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("name", form.name);
      fd.append("phone", form.phone);
      fd.append("shop_name", form.shop_name);
      fd.append("address", form.address);
      if (imageFile) fd.append("image", imageFile);

      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      };

      const res = await axios.put(`${PROFILE_API}/update-profile`, fd, { headers });
      toast.success("Profile updated");

      setExistingImage(res.data.user?.image || "");
      setImageFile(null);
      setImagePreview(null);

      // Agar Redux me user update action available hai, yahan dispatch kar dena:
      // dispatch(setUser(res.data.user));
    } catch (error) {
      toast.error(error.response?.data?.msg || "Could not update profile");
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    const { current_password, new_password, confirm_password } = passwordForm;

    if (!current_password || !new_password || !confirm_password) {
      return toast.error("Fill all password fields");
    }
    if (new_password !== confirm_password) {
      return toast.error("New password and confirm password don't match");
    }
    if (new_password.length < 6) {
      return toast.error("New password must be at least 6 characters");
    }

    setChangingPassword(true);
    try {
      await axios.put(
        `${PROFILE_API}/change-password`,
        { current_password, new_password },
        authHeaders
      );
      toast.success("Password changed successfully");
      setPasswordForm({ current_password: "", new_password: "", confirm_password: "" });
    } catch (error) {
      toast.error(error.response?.data?.msg || "Could not change password");
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-24 text-sm text-[#6B7280]">
        <i className="fa-solid fa-circle-notch animate-spin text-[#F97316]"></i>
        Loading…
      </div>
    );
  }

  const avatarSrc = imagePreview || getImageUrl(existingImage);

  const filteredReviews =
    ratingFilter === "all"
      ? reviews
      : reviews.filter((r) => Math.round(r.rating) === Number(ratingFilter));

  return (
    <div className="vp-body text-[#1F2937]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=Inter:wght@400;500;600;700&display=swap');
        .vp-display { font-family: 'Sora', system-ui, sans-serif; }
        .vp-body { font-family: 'Inter', system-ui, sans-serif; }
        .vp-input { transition: border-color 0.2s ease, box-shadow 0.2s ease; }
        .vp-input:focus { border-color: #F97316; box-shadow: 0 0 0 3px rgba(249,115,22,0.12); outline: none; }
        .vp-cta-primary { background-color: #F97316; transition: background-color 0.2s ease, transform 0.2s ease; }
        .vp-cta-primary:hover:not(:disabled) { background-color: #EA580C; transform: translateY(-1px); }
        .vp-cta-primary:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
        .vp-avatar-upload { transition: border-color 0.2s ease, background-color 0.2s ease; }
        .vp-avatar-upload:hover { border-color: #F97316; background-color: #FFF7ED; }
        .vp-eye-toggle { transition: color 0.2s ease; }
        .vp-chip { transition: background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease; }
        @keyframes vpSpin { to { transform: rotate(360deg); } }
        .vp-spin { animation: vpSpin 0.8s linear infinite; }
      `}</style>

      <h1 className="vp-display text-2xl font-extrabold sm:text-3xl">My Profile</h1>
      <p className="vp-body mt-1 text-sm text-[#6B7280]">
        Update your personal and shop details.
      </p>

      {/* Profile section — full width */}
      <form onSubmit={handleSubmit} className="mt-6 w-full">
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 sm:p-6">
          <div className="flex items-center gap-2.5 border-b border-[#F1F5F9] pb-4">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#F97316]/10 text-[#F97316]">
              <i className="fa-solid fa-store text-sm"></i>
            </span>
            <div>
              <h2 className="vp-display text-base font-bold leading-tight">Shop &amp; contact details</h2>
              <p className="vp-body text-xs text-[#6B7280]">Visible to customers browsing your services</p>
            </div>
          </div>

          {/* Avatar */}
          <div className="mt-5 flex flex-col items-center gap-4 sm:flex-row">
            {avatarSrc ? (
              <img
                src={avatarSrc}
                alt=""
                className="h-20 w-20 shrink-0 rounded-2xl border-2 border-[#F97316] object-cover"
              />
            ) : (
              <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-[#F8FAFC] text-[#F97316]">
                <i className="fa-solid fa-user text-2xl"></i>
              </span>
            )}
            <label className="vp-avatar-upload vp-body flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#E5E7EB] px-4 py-3 text-xs font-semibold text-[#6B7280] sm:w-auto sm:flex-1">
              <i className="fa-solid fa-camera text-[13px]"></i>
              {imageFile ? imageFile.name : "Click to change photo"}
              <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
            </label>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="vp-body mb-1 block text-xs font-semibold text-[#6B7280]">
                Full name
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="vp-input vp-body w-full rounded-xl border border-[#E5E7EB] px-3.5 py-2.5 text-sm"
                required
              />
            </div>
            <div>
              <label className="vp-body mb-1 block text-xs font-semibold text-[#6B7280]">
                Email
              </label>
              <input
                type="email"
                value={form.email}
                disabled
                className="vp-body w-full cursor-not-allowed rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] px-3.5 py-2.5 text-sm text-[#6B7280]"
              />
            </div>
             
            <div>
              <label className="vp-body mb-1 block text-xs font-semibold text-[#6B7280]">
                Shop name
              </label>
              <input
                type="text"
                value={form.shop_name}
                onChange={(e) => setForm({ ...form, shop_name: e.target.value })}
                placeholder="e.g. Sharma Electricals"
                className="vp-input vp-body w-full rounded-xl border border-[#E5E7EB] px-3.5 py-2.5 text-sm"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="vp-body mb-1 block text-xs font-semibold text-[#6B7280]">
              Address
            </label>
            <textarea
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              rows={3}
              placeholder="Shop / service area address"
              className="vp-input vp-body w-full resize-none rounded-xl border border-[#E5E7EB] px-3.5 py-2.5 text-sm"
            />
          </div>

          <div className="mt-5 flex justify-end border-t border-[#F1F5F9] pt-5">
            <button
              type="submit"
              disabled={saving}
              className="vp-cta-primary vp-body flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-semibold text-white"
            >
              {saving ? (
                <>
                  <i className="fa-solid fa-circle-notch animate-spin"></i>
                  Saving…
                </>
              ) : (
                <>
                  <i className="fa-solid fa-check"></i>
                  Save changes
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Reviews & ratings section — full width, on this same page */}
      <div className="mt-6 w-full">
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 sm:p-6">
          <div className="flex items-center gap-2.5 border-b border-[#F1F5F9] pb-4">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#F97316]/10 text-[#F97316]">
              <i className="fa-solid fa-star text-sm"></i>
            </span>
            <div>
              <h2 className="vp-display text-base font-bold leading-tight">Reviews &amp; ratings</h2>
              <p className="vp-body text-xs text-[#6B7280]">What customers have said about your services</p>
            </div>
          </div>

          {reviewsLoading ? (
            <div className="flex items-center justify-center gap-2 py-12 text-sm text-[#6B7280]">
              <i className="fa-solid fa-circle-notch vp-spin text-[#F97316]"></i>
              Loading reviews…
            </div>
          ) : totalReviews === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F8FAFC] text-xl text-[#F97316]">
                <i className="fa-regular fa-star"></i>
              </span>
              <p className="vp-body text-sm font-semibold">No reviews yet</p>
              <p className="vp-body max-w-sm text-xs text-[#6B7280]">
                Once customers rate a completed booking, their reviews will show up here.
              </p>
            </div>
          ) : (
            <>
              {/* Summary */}
              <div className="mt-5 grid grid-cols-1 gap-6 sm:grid-cols-[auto_1fr]">
                <div className="flex flex-col items-center justify-center gap-1 border-b border-[#F1F5F9] pb-5 sm:border-b-0 sm:border-r sm:pb-0 sm:pr-6">
                  <span className="vp-display text-4xl font-extrabold text-[#1F2937]">
                    {avgRating.toFixed(1)}
                  </span>
                  <StarRow value={avgRating} size="text-base" />
                  <span className="vp-body mt-1 text-xs text-[#6B7280]">
                    {totalReviews} review{totalReviews !== 1 ? "s" : ""}
                  </span>
                </div>
                <div className="flex items-center">
                  <RatingBreakdown reviews={reviews} />
                </div>
              </div>

              {/* Filter chips */}
              <div className="mt-5 flex flex-wrap gap-2 border-t border-[#F1F5F9] pt-5">
                <span
                  onClick={() => setRatingFilter("all")}
                  className={`vp-chip vp-body cursor-pointer rounded-full border px-4 py-1.5 text-xs font-semibold ${
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
                      className={`vp-chip vp-body cursor-pointer rounded-full border px-4 py-1.5 text-xs font-semibold ${
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

              {/* Review list — includes which service each rating was for */}
              <div className="mt-4 divide-y divide-[#F1F5F9]">
                {filteredReviews.length === 0 ? (
                  <p className="vp-body py-8 text-center text-sm text-[#6B7280]">
                    No reviews with this rating.
                  </p>
                ) : (
                  filteredReviews.map((r) => {
                    const avatarUrl = getImageUrl(r.user?.image);
                    const initial = (r.user?.name || "U").charAt(0).toUpperCase();
                    return (
                      <div key={r._id} className="flex gap-3 py-4">
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
                            <p className="vp-body truncate text-sm font-semibold">
                              {r.user?.name || "Customer"}
                            </p>
                            <span className="vp-body text-[11px] text-[#9CA3AF]">
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
                              <span className="vp-body inline-flex items-center gap-1 rounded-full bg-[#F8FAFC] px-2 py-0.5 text-[11px] font-medium text-[#6B7280]">
                                <i className="fa-solid fa-tags text-[10px] text-[#F97316]"></i>
                                {r.service.service_name}
                              </span>
                            )}
                          </div>

                          {r.comment && (
                            <p className="vp-body mt-2 text-sm leading-relaxed text-[#374151]">
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
      </div>

      {/* Password section — full width, below */}
      <form onSubmit={handlePasswordSubmit} className="mt-6 w-full">
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3 border-b border-[#F1F5F9] pb-4">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#F97316]/10 text-[#F97316]">
                <i className="fa-solid fa-lock text-sm"></i>
              </span>
              <div>
                <h2 className="vp-display text-base font-bold leading-tight">Change password</h2>
                <p className="vp-body text-xs text-[#6B7280]">Use a strong password you don't reuse elsewhere</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowPasswords((s) => !s)}
              className="vp-eye-toggle vp-body flex items-center gap-1.5 text-xs font-semibold text-[#6B7280] hover:text-[#F97316]"
            >
              <i className={`fa-solid ${showPasswords ? "fa-eye-slash" : "fa-eye"}`}></i>
              {showPasswords ? "Hide" : "Show"}
            </button>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="vp-body mb-1 block text-xs font-semibold text-[#6B7280]">
                Current password
              </label>
              <input
                type={showPasswords ? "text" : "password"}
                value={passwordForm.current_password}
                onChange={(e) => setPasswordForm({ ...passwordForm, current_password: e.target.value })}
                className="vp-input vp-body w-full rounded-xl border border-[#E5E7EB] px-3.5 py-2.5 text-sm"
              />
            </div>
            <div>
              <label className="vp-body mb-1 block text-xs font-semibold text-[#6B7280]">
                New password
              </label>
              <input
                type={showPasswords ? "text" : "password"}
                value={passwordForm.new_password}
                onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                className="vp-input vp-body w-full rounded-xl border border-[#E5E7EB] px-3.5 py-2.5 text-sm"
              />
            </div>
            <div>
              <label className="vp-body mb-1 block text-xs font-semibold text-[#6B7280]">
                Confirm new password
              </label>
              <input
                type={showPasswords ? "text" : "password"}
                value={passwordForm.confirm_password}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirm_password: e.target.value })}
                className="vp-input vp-body w-full rounded-xl border border-[#E5E7EB] px-3.5 py-2.5 text-sm"
              />
            </div>
          </div>

          <div className="mt-5 flex justify-end border-t border-[#F1F5F9] pt-5">
            <button
              type="submit"
              disabled={changingPassword}
              className="vp-cta-primary vp-body flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-semibold text-white"
            >
              {changingPassword ? (
                <>
                  <i className="fa-solid fa-circle-notch animate-spin"></i>
                  Updating…
                </>
              ) : (
                <>
                  <i className="fa-solid fa-key"></i>
                  Update password
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default VendorProfile;