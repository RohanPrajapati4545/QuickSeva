import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

const ADMIN_API = `${process.env.REACT_APP_API_URL}/api/admin/vendors`;
const BASE_URL = process.env.REACT_APP_API_URL;

const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (/^https?:\/\//i.test(imagePath)) return imagePath;
  const cleanBase = BASE_URL?.replace(/\/$/, "") || "";
  const cleanPath = imagePath.replace(/^\//, "");
  return `${cleanBase}/${cleanPath}`;
};

const STATUS_STYLES = {
  approved: "bg-green-50 text-green-700",
  rejected: "bg-red-50 text-red-600",
  pending: "bg-yellow-50 text-yellow-700",
};

const AvdStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=Inter:wght@400;500;600;700&display=swap');
    .avd-display { font-family: 'Sora', system-ui, sans-serif; }
    .avd-body { font-family: 'Inter', system-ui, sans-serif; }
    .avd-card { border-radius: 20px; }
    .avd-back-btn { transition: background-color 0.2s ease, color 0.2s ease; }
    .avd-btn { transition: background-color 0.2s ease, color 0.2s ease; }
    .avd-btn:disabled { opacity: 0.6; cursor: not-allowed; }
    .avd-input { transition: border-color 0.2s ease, box-shadow 0.2s ease; }
    .avd-input:focus { border-color: #F97316; box-shadow: 0 0 0 3px rgba(249,115,22,0.12); outline: none; }
    .avd-cta-primary { background-color: #F97316; transition: background-color 0.2s ease, transform 0.2s ease; }
    .avd-cta-primary:hover:not(:disabled) { background-color: #EA580C; transform: translateY(-1px); }
    .avd-cta-primary:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
    .avd-cta-secondary { transition: background-color 0.2s ease; }
    .avd-cta-secondary:hover { background-color: #F3F4F6; }
    .avd-camera-badge { transition: background-color 0.2s ease, transform 0.15s ease; }
    .avd-camera-badge:hover { background-color: #EA580C; transform: scale(1.06); }
    @keyframes avdSpin { to { transform: rotate(360deg); } }
    .avd-spin { animation: avdSpin 0.8s linear infinite; }
  `}</style>
);

const VendorDetails = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { token } = useSelector((state) => state.auth || {});

  const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

  const [vendorData, setVendorData] = useState(location.state?.vendor || null);
  const [loading, setLoading] = useState(!location.state?.vendor);
  const [updating, setUpdating] = useState(false);

  const [form, setForm] = useState({ name: "", shop_name: "", email: "", contact: "", address: "" });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [saving, setSaving] = useState(false);

  const hydrateForm = (v) => {
    setForm({
      name: v.name || "",
      shop_name: v.shop_name || "",
      email: v.email || "",
      contact: v.phone || "",
      address: v.address || "",
    });
  };

  // location.state.vendor (passed from the list page) only carries the
  // fields shown in the table — it doesn't include detail-only stats like
  // totalServices/totalBookings. So even when we have that partial data for
  // an instant paint, we still fetch the full record in the background and
  // merge it in.
  const fetchVendor = async () => {
    if (!vendorData) setLoading(true);
    try {
      const res = await axios.get(`${ADMIN_API}/vendor/${id}`, authHeaders);
      const v = res.data.vendor || null;
      setVendorData(v);
      if (v) hydrateForm(v);
    } catch (error) {
      toast.error(error.response?.data?.msg || "Could not load vendor");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) return;
    if (vendorData) hydrateForm(vendorData);
    fetchVendor();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, token]);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0] || null;
    setImageFile(file);
    setImagePreview(file ? URL.createObjectURL(file) : null);
  };

  const handleCancel = () => {
    hydrateForm(vendorData);
    setImageFile(null);
    setImagePreview(null);
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error("Owner name is required");
    if (!form.shop_name.trim()) return toast.error("Shop name is required");

    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("name", form.name);
      fd.append("shop_name", form.shop_name);
      fd.append("contact", form.contact);
      fd.append("address", form.address);
      if (imageFile) fd.append("image", imageFile);

      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      };

      const res = await axios.put(`${ADMIN_API}/update-vendor/${vendorData._id}`, fd, { headers });
      const updated = res.data.vendor;
      setVendorData((p) => ({ ...p, ...updated }));
      hydrateForm({ ...vendorData, ...updated });
      setImageFile(null);
      setImagePreview(null);
      toast.success("Vendor updated");
    } catch (error) {
      toast.error(error.response?.data?.msg || "Could not update vendor");
    } finally {
      setSaving(false);
    }
  };

  const updateApproval = async (approvalStatus) => {
    setUpdating(true);
    try {
      const res = await axios.put(
        `${ADMIN_API}/update-approval/${vendorData._id}`,
        { approvalStatus },
        authHeaders
      );
      setVendorData((p) => ({ ...p, ...res.data.vendor }));
      toast.success(`Vendor ${approvalStatus}`);
    } catch (error) {
      toast.error(error.response?.data?.msg || "Could not update approval");
    } finally {
      setUpdating(false);
    }
  };

  const handleApprove = async () => {
    const result = await Swal.fire({
      title: "Approve this vendor?",
      text: `"${vendorData.shop_name || vendorData.name}" will be able to list services once approved.`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, approve",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#16A34A",
      cancelButtonColor: "#9CA3AF",
    });
    if (!result.isConfirmed) return;
    updateApproval("approved");
  };

  const handleReject = async () => {
    const result = await Swal.fire({
      title: "Reject this vendor?",
      text: `"${vendorData.shop_name || vendorData.name}" and all their services will be hidden from customers.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, reject",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#DC2626",
      cancelButtonColor: "#9CA3AF",
    });
    if (!result.isConfirmed) return;
    updateApproval("rejected");
  };

  const handleToggleStatus = async () => {
    if (!vendorData) return;
    const nextStatus = !vendorData.status;

    const result = await Swal.fire({
      title: nextStatus ? "Unblock this vendor?" : "Block this vendor?",
      text: nextStatus
        ? `"${vendorData.shop_name || vendorData.name}" will be able to log in and their services will be visible again.`
        : `"${vendorData.shop_name || vendorData.name}" will be blocked from logging in and their services will be hidden from customers.`,
      icon: nextStatus ? "question" : "warning",
      showCancelButton: true,
      confirmButtonText: nextStatus ? "Yes, unblock" : "Yes, block",
      cancelButtonText: "Cancel",
      confirmButtonColor: nextStatus ? "#16A34A" : "#DC2626",
      cancelButtonColor: "#9CA3AF",
    });
    if (!result.isConfirmed) return;

    setUpdating(true);
    setVendorData((p) => ({ ...p, status: nextStatus }));

    try {
      const res = await axios.put(
        `${ADMIN_API}/update-status/${vendorData._id}`,
        { status: nextStatus },
        authHeaders
      );
      setVendorData((p) => ({ ...p, ...res.data.vendor }));
      toast.success("Vendor status updated");
    } catch (error) {
      setVendorData((p) => ({ ...p, status: !nextStatus }));
      toast.error(error.response?.data?.msg || "Could not update status");
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    const result = await Swal.fire({
      title: `Delete "${vendorData.shop_name || vendorData.name}"?`,
      text: "This will permanently remove the vendor account from the database. This can't be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#DC2626",
      cancelButtonColor: "#9CA3AF",
    });
    if (!result.isConfirmed) return;

    try {
      await axios.delete(`${ADMIN_API}/delete-vendor/${vendorData._id}`, authHeaders);
      toast.success("Vendor deleted");
      navigate("/admin/vendors");
    } catch (error) {
      toast.error(error.response?.data?.msg || "Could not delete vendor");
    }
  };

  if (loading) {
    return (
      <div className="avd-body flex min-h-screen items-center justify-center gap-2 bg-[#F8FAFC] text-sm text-[#6B7280]">
        <AvdStyles />
        <i className="fa-solid fa-circle-notch avd-spin text-[#F97316]"></i>
        Loading vendor…
      </div>
    );
  }

  if (!vendorData) {
    return (
      <div className="avd-body flex min-h-screen flex-col items-center justify-center gap-3 bg-[#F8FAFC] text-center px-4">
        <AvdStyles />
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-[#F97316] shadow-sm">
          <i className="fa-solid fa-triangle-exclamation text-xl"></i>
        </span>
        <p className="avd-body text-sm font-semibold">Vendor not found</p>
        <button
          onClick={() => navigate("/admin/vendors")}
          className="avd-body mt-1 rounded-xl bg-[#F97316] px-4 py-2 text-xs font-semibold text-white"
        >
          Back to vendors
        </button>
      </div>
    );
  }

  const approvalStatus = vendorData.approvalStatus || "pending";
  const avatarSrc = imagePreview || getImageUrl(vendorData.image);
  const isDirty =
    !!imageFile ||
    form.name !== (vendorData.name || "") ||
    form.shop_name !== (vendorData.shop_name || "") ||
    form.contact !== (vendorData.phone || "") ||
    form.address !== (vendorData.address || "");

  return (
    <div className="avd-body min-h-screen bg-[#F8FAFC] text-[#1F2937]">
      <AvdStyles />

      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <h1 className="avd-display text-xl font-extrabold sm:text-2xl">Vendor Profile</h1>
            <p className="avd-body mt-0.5 text-sm text-[#6B7280]">
              View and update this vendor's account
            </p>
          </div>
          <button
            onClick={() => navigate("/admin/vendors")}
            className="avd-back-btn avd-body flex shrink-0 items-center gap-2 rounded-full bg-white px-3.5 py-2 text-xs font-semibold text-[#6B7280] shadow-sm hover:bg-[#F97316]/10 hover:text-[#F97316]"
          >
            <i className="fa-solid fa-arrow-left"></i>
            Back
          </button>
        </div>

        {/* Profile card: avatar left, form fields right */}
        <form onSubmit={handleProfileSubmit}>
          <div className="avd-card border border-[#E5E7EB] bg-white p-5 shadow-[0_20px_45px_-30px_rgba(31,41,55,0.2)] sm:p-6">
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
                      <i className="fa-solid fa-store text-3xl"></i>
                    </span>
                  )}
                  <span className="avd-camera-badge absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full bg-[#F97316] text-white ring-2 ring-white">
                    <i className="fa-solid fa-camera text-[11px]"></i>
                  </span>
                  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                </label>

                <div>
                  <p className="avd-body text-base font-bold">{form.shop_name || form.name || "—"}</p>
                  <p className="avd-body text-xs text-[#9CA3AF]">{form.name}</p>
                </div>

                <span className={`avd-body rounded-full px-3 py-1 text-xs font-semibold capitalize ${STATUS_STYLES[approvalStatus]}`}>
                  {approvalStatus}
                </span>
              </div>

              {/* Right: editable fields */}
              <div className="flex flex-col gap-4 md:col-span-2">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="avd-body mb-1 block text-sm font-semibold text-[#374151]">
                      Shop Name
                    </label>
                    <input
                      type="text"
                      value={form.shop_name}
                      onChange={(e) => setForm({ ...form, shop_name: e.target.value })}
                      className="avd-input avd-body w-full rounded-lg border border-[#E5E7EB] px-3.5 py-2.5 text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="avd-body mb-1 block text-sm font-semibold text-[#374151]">
                      Owner Name
                    </label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="avd-input avd-body w-full rounded-lg border border-[#E5E7EB] px-3.5 py-2.5 text-sm"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="avd-body mb-1 block text-sm font-semibold text-[#374151]">
                    Email
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    disabled
                    className="avd-body w-full cursor-not-allowed rounded-lg border border-[#E5E7EB] bg-[#F8FAFC] px-3.5 py-2.5 text-sm text-[#6B7280]"
                  />
                </div>

                <div>
                  <label className="avd-body mb-1 block text-sm font-semibold text-[#374151]">
                    Phone
                  </label>
                  <input
                    type="text"
                    value={form.contact}
                    onChange={(e) => setForm({ ...form, contact: e.target.value })}
                    className="avd-input avd-body w-full rounded-lg border border-[#E5E7EB] px-3.5 py-2.5 text-sm"
                  />
                </div>

                <div>
                  <label className="avd-body mb-1 block text-sm font-semibold text-[#374151]">
                    Address
                  </label>
                  <textarea
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    rows={3}
                    className="avd-input avd-body w-full resize-none rounded-lg border border-[#E5E7EB] px-3.5 py-2.5 text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-lg border border-[#F1F5F9] bg-[#F8FAFC] px-3.5 py-2.5">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-[#9CA3AF]">Services</p>
                    <p className="mt-0.5 text-sm font-semibold">{vendorData.totalServices ?? "—"}</p>
                  </div>
                  <div className="rounded-lg border border-[#F1F5F9] bg-[#F8FAFC] px-3.5 py-2.5">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-[#9CA3AF]">Bookings</p>
                    <p className="mt-0.5 text-sm font-semibold">{vendorData.totalBookings ?? "—"}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center gap-3 border-t border-[#F1F5F9] pt-5">
              <button
                type="submit"
                disabled={saving || !isDirty}
                className="avd-cta-primary avd-body flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold text-white"
              >
                {saving ? (
                  <>
                    <i className="fa-solid fa-circle-notch avd-spin"></i>
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
                className="avd-cta-secondary avd-body rounded-lg border border-[#E5E7EB] bg-white px-5 py-2.5 text-sm font-semibold text-[#374151] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </form>

        {/* Vendor controls */}
        <div className="avd-card mt-6 border border-[#E5E7EB] bg-white p-5 shadow-[0_20px_45px_-30px_rgba(31,41,55,0.25)] sm:p-6">
          <h2 className="avd-display text-base font-bold">Vendor Controls</h2>
          <p className="avd-body mt-0.5 text-xs text-[#6B7280]">Approve, block, or remove this vendor</p>

          <div className="mt-5 flex flex-col gap-3">
            {approvalStatus === "pending" && (
              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  disabled={updating}
                  onClick={handleApprove}
                  className="avd-btn avd-body flex flex-1 items-center justify-center gap-2 rounded-lg bg-green-50 px-4 py-3 text-sm font-semibold text-green-700 hover:bg-green-100"
                >
                  {updating ? (
                    <i className="fa-solid fa-circle-notch avd-spin"></i>
                  ) : (
                    <i className="fa-solid fa-check"></i>
                  )}
                  Approve
                </button>
                <button
                  disabled={updating}
                  onClick={handleReject}
                  className="avd-btn avd-body flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-50 px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-100"
                >
                  <i className="fa-solid fa-xmark"></i>
                  Reject
                </button>
              </div>
            )}

            {approvalStatus === "rejected" && (
              <button
                disabled={updating}
                onClick={handleApprove}
                className="avd-btn avd-body flex items-center justify-center gap-2 rounded-lg bg-green-50 px-5 py-3 text-sm font-semibold text-green-700 hover:bg-green-100"
              >
                {updating ? (
                  <i className="fa-solid fa-circle-notch avd-spin"></i>
                ) : (
                  <i className="fa-solid fa-check"></i>
                )}
                Approve vendor
              </button>
            )}

            {approvalStatus === "approved" && (
              <button
                disabled={updating}
                onClick={handleReject}
                className="avd-btn avd-body flex items-center justify-center gap-2 rounded-lg bg-red-50 px-5 py-3 text-sm font-semibold text-red-600 hover:bg-red-100"
              >
                {updating ? (
                  <i className="fa-solid fa-circle-notch avd-spin"></i>
                ) : (
                  <i className="fa-solid fa-xmark"></i>
                )}
                Reject vendor
              </button>
            )}

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                disabled={updating}
                onClick={handleToggleStatus}
                className={`avd-btn avd-body flex flex-1 items-center justify-center gap-2 rounded-lg px-5 py-3 text-sm font-semibold ${
                  vendorData.status
                    ? "bg-green-50 text-green-700 hover:bg-green-100"
                    : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                }`}
              >
                {updating ? (
                  <i className="fa-solid fa-circle-notch avd-spin"></i>
                ) : (
                  <i className={`fa-solid ${vendorData.status ? "fa-toggle-on" : "fa-toggle-off"}`}></i>
                )}
                {vendorData.status ? "Active — tap to block" : "Blocked — tap to unblock"}
              </button>

              <button
                onClick={handleDelete}
                className="avd-btn avd-body flex flex-1 items-center justify-center gap-2 rounded-lg border border-[#E5E7EB] px-5 py-3 text-sm font-semibold text-[#6B7280] hover:border-red-200 hover:bg-red-50 hover:text-red-500"
              >
                <i className="fa-solid fa-trash"></i>
                Delete vendor
              </button>
            </div>
          </div>

          <p className="avd-body mt-4 flex items-center justify-center gap-1.5 text-center text-[11px] text-[#9CA3AF]">
            <i className="fa-solid fa-lock text-[10px]"></i>
            Changes are applied instantly.
          </p>
        </div>
      </div>
    </div>
  );
};

export default VendorDetails;