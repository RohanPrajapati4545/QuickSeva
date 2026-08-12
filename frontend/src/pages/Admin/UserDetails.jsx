import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

const ADMIN_API = `${process.env.REACT_APP_API_URL}/api/admin/users`;
const BASE_URL = process.env.REACT_APP_API_URL;

const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (/^https?:\/\//i.test(imagePath)) return imagePath;
  const cleanBase = BASE_URL?.replace(/\/$/, "") || "";
  const cleanPath = imagePath.replace(/^\//, "");
  return `${cleanBase}/${cleanPath}`;
};

const ApStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=Inter:wght@400;500;600;700&display=swap');
    .ap-display { font-family: 'Sora', system-ui, sans-serif; }
    .ap-body { font-family: 'Inter', system-ui, sans-serif; }
    .ap-card { border-radius: 20px; }
    .ap-back-btn { transition: background-color 0.2s ease, color 0.2s ease; }
    .ap-status-toggle { transition: background-color 0.2s ease, color 0.2s ease; }
    .ap-danger-btn { transition: background-color 0.2s ease, color 0.2s ease; }
    .ap-input { transition: border-color 0.2s ease, box-shadow 0.2s ease; }
    .ap-input:focus { border-color: #F97316; box-shadow: 0 0 0 3px rgba(249,115,22,0.12); outline: none; }
    .ap-cta-primary { background-color: #F97316; transition: background-color 0.2s ease, transform 0.2s ease; }
    .ap-cta-primary:hover:not(:disabled) { background-color: #EA580C; transform: translateY(-1px); }
    .ap-cta-primary:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
    .ap-cta-secondary { transition: background-color 0.2s ease; }
    .ap-cta-secondary:hover { background-color: #F3F4F6; }
    .ap-camera-badge { transition: background-color 0.2s ease, transform 0.15s ease; }
    .ap-camera-badge:hover { background-color: #EA580C; transform: scale(1.06); }
    @keyframes apSpin { to { transform: rotate(360deg); } }
    .ap-spin { animation: apSpin 0.8s linear infinite; }
  `}</style>
);

const UserDetails = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { token } = useSelector((state) => state.auth || {});

  const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

  const [userData, setUserData] = useState(location.state?.user || null);
  const [loading, setLoading] = useState(!location.state?.user);
  const [updating, setUpdating] = useState(false);

  const [form, setForm] = useState({ name: "", email: "", contact: "", address: "" });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [saving, setSaving] = useState(false);

  const hydrateForm = (u) => {
    setForm({
      name: u.name || "",
      email: u.email || "",
      contact: u.phone || "",
      address: u.address || "",
    });
  };

  // location.state.user (passed from the list page) only carries the fields
  // shown in the table — it doesn't include detail-only stats like
  // totalBookings. So even when we have that partial data for an instant
  // paint, we still fetch the full record in the background and merge it in.
  const fetchUser = async () => {
    if (!userData) setLoading(true);
    try {
      const res = await axios.get(`${ADMIN_API}/user/${id}`, authHeaders);
      const u = res.data.user || null;
      setUserData(u);
      if (u) hydrateForm(u);
    } catch (error) {
      toast.error(error.response?.data?.msg || "Could not load user");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) return;
    if (userData) hydrateForm(userData);
    fetchUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, token]);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0] || null;
    setImageFile(file);
    setImagePreview(file ? URL.createObjectURL(file) : null);
  };

  const handleCancel = () => {
    hydrateForm(userData);
    setImageFile(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error("Name is required");

    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("name", form.name);
      fd.append("contact", form.contact);
      fd.append("address", form.address);
      if (imageFile) fd.append("image", imageFile);

      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      };

      const res = await axios.put(`${ADMIN_API}/update-user/${userData._id}`, fd, { headers });
      const updated = res.data.user;
      setUserData((p) => ({ ...p, ...updated }));
      hydrateForm({ ...userData, ...updated });
      setImageFile(null);
      setImagePreview(null);
      toast.success("User updated");
    } catch (error) {
      toast.error(error.response?.data?.msg || "Could not update user");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!userData) return;
    const nextStatus = !userData.status;
    setUpdating(true);
    setUserData((p) => ({ ...p, status: nextStatus }));

    try {
      const res = await axios.put(
        `${ADMIN_API}/update-status/${userData._id}`,
        { status: nextStatus },
        authHeaders
      );
      setUserData((p) => ({ ...p, ...res.data.user }));
      toast.success("User status updated");
    } catch (error) {
      setUserData((p) => ({ ...p, status: !nextStatus }));
      toast.error(error.response?.data?.msg || "Could not update status");
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    const result = await Swal.fire({
      title: `Delete "${userData.name}"?`,
      text: "This will remove the user account and can't be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
      confirmButtonColor: "#DC2626",
    });
    if (!result.isConfirmed) return;

    try {
      await axios.delete(`${ADMIN_API}/delete-user/${userData._id}`, authHeaders);
      toast.success("User deleted");
      navigate("/admin/users");
    } catch (error) {
      toast.error(error.response?.data?.msg || "Could not delete user");
    }
  };

  if (loading) {
    return (
      <div className="ap-body flex min-h-screen items-center justify-center gap-2 bg-[#F8FAFC] text-sm text-[#6B7280]">
        <ApStyles />
        <i className="fa-solid fa-circle-notch ap-spin text-[#F97316]"></i>
        Loading user…
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="ap-body flex min-h-screen flex-col items-center justify-center gap-3 bg-[#F8FAFC] text-center">
        <ApStyles />
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-[#F97316]">
          <i className="fa-solid fa-triangle-exclamation text-xl"></i>
        </span>
        <p className="ap-body text-sm font-semibold">User not found</p>
        <button
          onClick={() => navigate("/admin/users")}
          className="ap-body mt-1 rounded-xl bg-[#F97316] px-4 py-2 text-xs font-semibold text-white"
        >
          Back to users
        </button>
      </div>
    );
  }

  const avatarSrc = imagePreview || getImageUrl(userData.image);
  const isDirty =
    !!imageFile ||
    form.name !== (userData.name || "") ||
    form.contact !== (userData.phone || "") ||
    form.address !== (userData.address || "");

  return (
    <div className="ap-body min-h-screen bg-[#F8FAFC] text-[#1F2937]">
      <ApStyles />

      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <h1 className="ap-display text-xl font-extrabold sm:text-2xl">Customer Profile</h1>
            <p className="ap-body mt-0.5 text-sm text-[#6B7280]">
              View and update this customer's account
            </p>
          </div>
          <button
            onClick={() => navigate("/admin/users")}
            className="ap-back-btn ap-body flex shrink-0 items-center gap-2 rounded-full bg-white px-3.5 py-2 text-xs font-semibold text-[#6B7280] shadow-sm hover:bg-[#F97316]/10 hover:text-[#F97316]"
          >
            <i className="fa-solid fa-arrow-left"></i>
            Back
          </button>
        </div>

        {/* Profile card: avatar left, form fields right */}
        <form onSubmit={handleSubmit}>
          <div className="ap-card border border-[#E5E7EB] bg-white p-5 shadow-[0_20px_45px_-30px_rgba(31,41,55,0.2)] sm:p-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {/* Left: avatar + identity */}
              <div className="flex flex-col items-center gap-3 text-center md:border-r md:border-[#F1F5F9] md:pr-6">
                <label className="relative cursor-pointer">
                  {avatarSrc ? (
                    <img
                      src={avatarSrc}
                      alt=""
                      className="h-24 w-24 rounded-full border-4 border-white object-cover shadow-md"
                    />
                  ) : (
                    <span className="flex h-24 w-24 items-center justify-center rounded-full bg-[#F8FAFC] text-[#F97316] shadow-md">
                      <i className="fa-solid fa-user text-3xl"></i>
                    </span>
                  )}
                  <span className="ap-camera-badge absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full bg-[#F97316] text-white ring-2 ring-white">
                    <i className="fa-solid fa-camera text-[11px]"></i>
                  </span>
                  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                </label>

                <div>
                  <p className="ap-body text-base font-bold">{form.name || "—"}</p>
                  <p className="ap-body text-xs text-[#9CA3AF]">Customer</p>
                </div>

                <span
                  className={`ap-body rounded-full px-3 py-1 text-xs font-semibold ${
                    userData.status ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {userData.status ? "Active" : "Inactive"}
                </span>
              </div>

              {/* Right: editable fields */}
              <div className="flex flex-col gap-4 md:col-span-2">
                <div>
                  <label className="ap-body mb-1 block text-sm font-semibold text-[#374151]">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="ap-input ap-body w-full rounded-lg border border-[#E5E7EB] px-3.5 py-2.5 text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="ap-body mb-1 block text-sm font-semibold text-[#374151]">
                    Email
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    disabled
                    className="ap-body w-full cursor-not-allowed rounded-lg border border-[#E5E7EB] bg-[#F8FAFC] px-3.5 py-2.5 text-sm text-[#6B7280]"
                  />
                </div>

                <div>
                  <label className="ap-body mb-1 block text-sm font-semibold text-[#374151]">
                    Phone
                  </label>
                  <input
                    type="text"
                    value={form.contact}
                    onChange={(e) => setForm({ ...form, contact: e.target.value })}
                    className="ap-input ap-body w-full rounded-lg border border-[#E5E7EB] px-3.5 py-2.5 text-sm"
                  />
                </div>

                <div>
                  <label className="ap-body mb-1 block text-sm font-semibold text-[#374151]">
                    Address
                  </label>
                  <textarea
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    rows={3}
                    placeholder="Customer's address"
                    className="ap-input ap-body w-full resize-none rounded-lg border border-[#E5E7EB] px-3.5 py-2.5 text-sm"
                  />
                </div>

                <div className="rounded-lg border border-[#F1F5F9] bg-[#F8FAFC] px-3.5 py-2.5">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-[#9CA3AF]">
                    Total bookings
                  </p>
                  <p className="mt-0.5 text-sm font-semibold">{userData.totalBookings ?? "—"}</p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center gap-3 border-t border-[#F1F5F9] pt-5">
              <button
                type="submit"
                disabled={saving || !isDirty}
                className="ap-cta-primary ap-body flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold text-white"
              >
                {saving ? (
                  <>
                    <i className="fa-solid fa-circle-notch ap-spin"></i>
                    Saving…
                  </>
                ) : (
                  "Save Changes"
                )}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                disabled={saving || !isDirty}
                className="ap-cta-secondary ap-body rounded-lg border border-[#E5E7EB] bg-white px-5 py-2.5 text-sm font-semibold text-[#374151] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </form>

        {/* Account controls */}
        <div className="ap-card mt-6 border border-[#E5E7EB] bg-white p-5 shadow-[0_20px_45px_-30px_rgba(31,41,55,0.25)] sm:p-6">
          <h2 className="ap-display text-base font-bold">Account Controls</h2>
          <p className="ap-body mt-0.5 text-xs text-[#6B7280]">Activate, deactivate, or remove this account</p>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <button
              disabled={updating}
              onClick={handleToggleStatus}
              className={`ap-status-toggle ap-body flex flex-1 items-center justify-center gap-2 rounded-lg px-5 py-3 text-sm font-semibold ${
                userData.status
                  ? "bg-green-50 text-green-600 hover:bg-green-100"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              }`}
            >
              {updating ? (
                <i className="fa-solid fa-circle-notch ap-spin"></i>
              ) : (
                <i className={`fa-solid ${userData.status ? "fa-toggle-on" : "fa-toggle-off"}`}></i>
              )}
              {userData.status ? "Active — tap to deactivate" : "Inactive — tap to activate"}
            </button>

            <button
              onClick={handleDelete}
              className="ap-danger-btn ap-body flex flex-1 items-center justify-center gap-2 rounded-lg border border-[#E5E7EB] px-5 py-3 text-sm font-semibold text-[#6B7280] hover:bg-red-50 hover:text-red-500"
            >
              <i className="fa-solid fa-trash"></i>
              Delete user
            </button>
          </div>

          <p className="ap-body mt-4 flex items-center justify-center gap-1.5 text-center text-[11px] text-[#9CA3AF]">
            <i className="fa-solid fa-lock text-[10px]"></i>
            Changes are applied instantly.
          </p>
        </div>
      </div>
    </div>
  );
};

export default UserDetails;