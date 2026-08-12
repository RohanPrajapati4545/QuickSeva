import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";

 
const PROFILE_API = `${process.env.REACT_APP_API_URL}/api/user-profile`;
const BASE_URL = process.env.REACT_APP_API_URL;

const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (/^https?:\/\//i.test(imagePath)) return imagePath;
  const cleanBase = BASE_URL?.replace(/\/$/, "") || "";
  const cleanPath = imagePath.replace(/^\//, "");
  return `${cleanBase}/${cleanPath}`;
};

const UserProfile = () => {
  const { token } = useSelector((state) => state.auth || {});

  const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

  const [form, setForm] = useState({
    name: "",
    email: "",
     
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

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${PROFILE_API}/profile`, authHeaders);
      const u = res.data.user;
      setForm({
        name: u.name || "",
        email: u.email || "",
        
        address: u.address || "",
      });
      setExistingImage(u.image || "");
    } catch (error) {
      toast.error(error.response?.data?.msg || "Could not load profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchProfile();
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

  return (
    <div className="up-body min-h-screen bg-[#F8FAFC] text-[#1F2937]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=Inter:wght@400;500;600;700&display=swap');
        .up-display { font-family: 'Sora', system-ui, sans-serif; }
        .up-body { font-family: 'Inter', system-ui, sans-serif; }
        .up-input { transition: border-color 0.2s ease, box-shadow 0.2s ease; }
        .up-input:focus { border-color: #F97316; box-shadow: 0 0 0 3px rgba(249,115,22,0.12); outline: none; }
        .up-cta-primary { background-color: #F97316; transition: background-color 0.2s ease, transform 0.2s ease; }
        .up-cta-primary:hover:not(:disabled) { background-color: #EA580C; transform: translateY(-1px); }
        .up-cta-primary:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
        .up-avatar-upload { transition: border-color 0.2s ease, background-color 0.2s ease; }
        .up-avatar-upload:hover { border-color: #F97316; background-color: #FFF7ED; }
        .up-eye-toggle { transition: color 0.2s ease; }
      `}</style>

      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <h1 className="up-display text-2xl font-extrabold sm:text-3xl">My Profile</h1>
        <p className="up-body mt-1 text-sm text-[#6B7280]">
          Manage your personal details and account security.
        </p>

        {/* Profile section — full width */}
        <form onSubmit={handleSubmit} className="mt-6 w-full">
          <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 sm:p-6">
            <div className="flex items-center gap-2.5 border-b border-[#F1F5F9] pb-4">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#F97316]/10 text-[#F97316]">
                <i className="fa-solid fa-user text-sm"></i>
              </span>
              <div>
                <h2 className="up-display text-base font-bold leading-tight">Personal details</h2>
                <p className="up-body text-xs text-[#6B7280]">Used for bookings and vendor contact</p>
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
              <label className="up-avatar-upload up-body flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#E5E7EB] px-4 py-3 text-xs font-semibold text-[#6B7280] sm:w-auto sm:flex-1">
                <i className="fa-solid fa-camera text-[13px]"></i>
                {imageFile ? imageFile.name : "Click to change photo"}
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              </label>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <label className="up-body mb-1 block text-xs font-semibold text-[#6B7280]">
                  Full name
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="up-input up-body w-full rounded-xl border border-[#E5E7EB] px-3.5 py-2.5 text-sm"
                  required
                />
              </div>
              <div>
                <label className="up-body mb-1 block text-xs font-semibold text-[#6B7280]">
                  Email
                </label>
                <input
                  type="email"
                  value={form.email}
                  disabled
                  className="up-body w-full cursor-not-allowed rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] px-3.5 py-2.5 text-sm text-[#6B7280]"
                />
              </div>
              
            </div>

            <div className="mt-4">
              <label className="up-body mb-1 block text-xs font-semibold text-[#6B7280]">
                Address
              </label>
              <textarea
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                rows={3}
                placeholder="Your delivery / service address"
                className="up-input up-body w-full resize-none rounded-xl border border-[#E5E7EB] px-3.5 py-2.5 text-sm"
              />
            </div>

            <div className="mt-5 flex justify-end border-t border-[#F1F5F9] pt-5">
              <button
                type="submit"
                disabled={saving}
                className="up-cta-primary up-body flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-semibold text-white"
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

        {/* Password section — full width, below */}
        <form onSubmit={handlePasswordSubmit} className="mt-6 w-full">
          <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 sm:p-6">
            <div className="flex items-center justify-between gap-3 border-b border-[#F1F5F9] pb-4">
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#F97316]/10 text-[#F97316]">
                  <i className="fa-solid fa-lock text-sm"></i>
                </span>
                <div>
                  <h2 className="up-display text-base font-bold leading-tight">Change password</h2>
                  <p className="up-body text-xs text-[#6B7280]">Use a strong password you don't reuse elsewhere</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowPasswords((s) => !s)}
                className="up-eye-toggle up-body flex items-center gap-1.5 text-xs font-semibold text-[#6B7280] hover:text-[#F97316]"
              >
                <i className={`fa-solid ${showPasswords ? "fa-eye-slash" : "fa-eye"}`}></i>
                {showPasswords ? "Hide" : "Show"}
              </button>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <label className="up-body mb-1 block text-xs font-semibold text-[#6B7280]">
                  Current password
                </label>
                <input
                  type={showPasswords ? "text" : "password"}
                  value={passwordForm.current_password}
                  onChange={(e) => setPasswordForm({ ...passwordForm, current_password: e.target.value })}
                  className="up-input up-body w-full rounded-xl border border-[#E5E7EB] px-3.5 py-2.5 text-sm"
                />
              </div>
              <div>
                <label className="up-body mb-1 block text-xs font-semibold text-[#6B7280]">
                  New password
                </label>
                <input
                  type={showPasswords ? "text" : "password"}
                  value={passwordForm.new_password}
                  onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                  className="up-input up-body w-full rounded-xl border border-[#E5E7EB] px-3.5 py-2.5 text-sm"
                />
              </div>
              <div>
                <label className="up-body mb-1 block text-xs font-semibold text-[#6B7280]">
                  Confirm new password
                </label>
                <input
                  type={showPasswords ? "text" : "password"}
                  value={passwordForm.confirm_password}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirm_password: e.target.value })}
                  className="up-input up-body w-full rounded-xl border border-[#E5E7EB] px-3.5 py-2.5 text-sm"
                />
              </div>
            </div>

            <div className="mt-5 flex justify-end border-t border-[#F1F5F9] pt-5">
              <button
                type="submit"
                disabled={changingPassword}
                className="up-cta-primary up-body flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-semibold text-white"
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
    </div>
  );
};

export default UserProfile;