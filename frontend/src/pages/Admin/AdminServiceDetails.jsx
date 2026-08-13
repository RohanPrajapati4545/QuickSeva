import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

const SERVICE_API = `${process.env.REACT_APP_API_URL}/api/admin/services`;
const BASE_URL = process.env.REACT_APP_API_URL;

const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (/^https?:\/\//i.test(imagePath)) return imagePath;
  const cleanBase = BASE_URL?.replace(/\/$/, "") || "";
  const cleanPath = imagePath.replace(/^\//, "");
  return `${cleanBase}/${cleanPath}`;
};

const STATUS_STYLES = {
  pending: "bg-yellow-50 text-yellow-700 ring-1 ring-yellow-200",
  approved: "bg-green-50 text-green-700 ring-1 ring-green-200",
  rejected: "bg-red-50 text-red-600 ring-1 ring-red-200",
};

const STATUS_ICON = {
  pending: "fa-hourglass-half",
  approved: "fa-circle-check",
  rejected: "fa-circle-xmark",
};

const AsdStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=Inter:wght@400;500;600;700&display=swap');
    .asd-display { font-family: 'Sora', system-ui, sans-serif; }
    .asd-body { font-family: 'Inter', system-ui, sans-serif; }
    .asd-card { border-radius: 26px; }
    .asd-back-btn { transition: background-color 0.2s ease, color 0.2s ease, transform 0.2s ease; }
    .asd-back-btn:hover { transform: translateX(-2px); }
    .asd-btn { transition: background-color 0.2s ease, color 0.2s ease, transform 0.15s ease, box-shadow 0.2s ease; }
    .asd-btn:hover:not(:disabled) { transform: translateY(-1px); }
    .asd-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
    .asd-chip { transition: border-color 0.2s ease, background-color 0.2s ease; }
    .asd-hero { background: linear-gradient(135deg, #1F2937 0%, #111827 100%); }
    @keyframes asdSpin { to { transform: rotate(360deg); } }
    .asd-spin { animation: asdSpin 0.8s linear infinite; }
    @keyframes asdFadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    .asd-fade-up { animation: asdFadeUp 0.4s ease-out; }
  `}</style>
);

const StatBlock = ({ icon, label, value }) => (
  <div className="asd-body flex items-start gap-3 rounded-2xl border border-[#F1F5F9] bg-[#F8FAFC] p-3.5">
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-[#F97316] shadow-sm">
      <i className={`fa-solid ${icon} text-sm`}></i>
    </span>
    <div className="min-w-0">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-[#9CA3AF]">{label}</p>
      <p className="mt-0.5 truncate text-sm font-semibold text-[#1F2937]">{value || "—"}</p>
    </div>
  </div>
);

const AdminServiceDetails = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { token } = useSelector((state) => state.auth || {});

  const [service, setService] = useState(location.state?.service || null);
  const [loading, setLoading] = useState(!location.state?.service);
  const [updating, setUpdating] = useState(false);

  const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

  const fetchService = async () => {
    if (!service) setLoading(true);
    try {
      const res = await axios.get(`${SERVICE_API}/service/${id}`, authHeaders);
      setService(res.data.service || null);
    } catch (error) {
      toast.error(error.response?.data?.msg || "Could not load service");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchService();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, token]);

  const updateApproval = async (approvalStatus) => {
    setUpdating(true);
    try {
      const res = await axios.put(
        `${SERVICE_API}/update-approval/${service._id}`,
        { approvalStatus },
        authHeaders
      );
      setService(res.data.service);
      toast.success(`Service ${approvalStatus}`);
    } catch (error) {
      const data = error.response?.data;

      // Backend ne bhi yehi guard laga rakha hai (vendor khud approved
      // nahi hai) — safety net agar frontend state stale ho jaye.
      if (data?.vendorNotApproved) {
        toast.error(data.msg || "Vendor is not approved yet");
        if (data.vendorId) {
          navigate(`/admin/vendors/${data.vendorId}`);
        }
        return;
      }

      toast.error(data?.msg || "Could not update approval");
    } finally {
      setUpdating(false);
    }
  };

  const handleApprove = async () => {
    // Vendor khud approved nahi hai to service approve karne se pehle
    // admin ko vendor approve karne ke liye bhej do.
    if (service.vendor && service.vendor.approvalStatus !== "approved") {
      const goToVendor = await Swal.fire({
        title: "Vendor not approved yet",
        text: `"${service.vendor?.shop_name || service.vendor?.name}" is not approved yet. You need to approve the vendor first before approving their service.`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Go to vendor",
        cancelButtonText: "Cancel",
        confirmButtonColor: "#F97316",
        cancelButtonColor: "#9CA3AF",
      });
      if (goToVendor.isConfirmed && service.vendor?._id) {
        navigate(`/admin/vendors/${service.vendor._id}`);
      }
      return;
    }

    const result = await Swal.fire({
      title: "Approve this service?",
      text: `"${service.service_name}" will immediately become visible to customers on the site.`,
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
      title: "Reject this service?",
      text: `"${service.service_name}" will be hidden from customers until it's approved again.`,
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

  const handleDelete = async () => {
    const result = await Swal.fire({
      title: `Delete "${service.service_name}"?`,
      text: "This will permanently remove the service request from the database. This can't be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#DC2626",
      cancelButtonColor: "#9CA3AF",
    });
    if (!result.isConfirmed) return;

    try {
      await axios.delete(`${SERVICE_API}/delete-service/${service._id}`, authHeaders);
      toast.success("Service deleted");
      navigate("/admin/services");
    } catch (error) {
      toast.error(error.response?.data?.msg || "Could not delete service");
    }
  };

  if (loading) {
    return (
      <div className="asd-body flex min-h-screen items-center justify-center gap-2 bg-[#F8FAFC] text-sm text-[#6B7280]">
        <AsdStyles />
        <i className="fa-solid fa-circle-notch asd-spin text-[#F97316]"></i>
        Loading service…
      </div>
    );
  }

  if (!service) {
    return (
      <div className="asd-body flex min-h-screen flex-col items-center justify-center gap-3 bg-[#F8FAFC] text-center px-4">
        <AsdStyles />
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-[#F97316] shadow-sm">
          <i className="fa-solid fa-triangle-exclamation text-xl"></i>
        </span>
        <p className="asd-body text-sm font-semibold">Service not found</p>
        <button
          onClick={() => navigate("/admin/services")}
          className="asd-body mt-1 rounded-xl bg-[#F97316] px-4 py-2 text-xs font-semibold text-white"
        >
          Back to services
        </button>
      </div>
    );
  }

  const approvalStatus = service.approvalStatus || "pending";
  const vendorApproved = service.vendor?.approvalStatus === "approved";

  return (
    <div className="asd-body min-h-screen bg-[#F8FAFC] text-[#1F2937]">
      <AsdStyles />

      <div className="mx-auto max-w-6xl px-3 py-5 sm:px-6 sm:py-8">
        <button
          onClick={() => navigate("/admin/services")}
          className="asd-back-btn asd-body mb-4 flex items-center gap-2 rounded-full bg-white px-3.5 py-2 text-xs font-semibold text-[#6B7280] shadow-sm hover:bg-[#F97316]/10 hover:text-[#F97316] sm:mb-6"
        >
          <i className="fa-solid fa-arrow-left"></i>
          Back to services
        </button>

        <div className="asd-fade-up grid grid-cols-1 gap-5 lg:grid-cols-5 lg:gap-8">
          <div className="space-y-5 lg:col-span-3">
            {/* Hero image / summary card */}
            <div className="asd-card overflow-hidden border border-[#E5E7EB] bg-white shadow-[0_20px_50px_-32px_rgba(31,41,55,0.35)]">
              {service.image ? (
                <div className="relative w-full bg-[#F1F5F9]">
                  <div className="aspect-[16/10] w-full sm:aspect-[16/9]">
                    <img
                      src={getImageUrl(service.image)}
                      alt={service.service_name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="absolute inset-x-0 top-0 flex items-start justify-between p-3 sm:p-4">
                    <span
                      className={`asd-body flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold capitalize shadow-sm backdrop-blur ${STATUS_STYLES[approvalStatus]}`}
                    >
                      <i className={`fa-solid ${STATUS_ICON[approvalStatus]} text-[11px]`}></i>
                      {approvalStatus}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="asd-hero relative flex aspect-[16/10] w-full items-center justify-center text-[#F97316] sm:aspect-[16/9]">
                  <i className={`fa-solid ${service.category?.icon || "fa-tags"} text-6xl opacity-90`}></i>
                  <div className="absolute inset-x-0 top-0 flex items-start justify-between p-3 sm:p-4">
                    <span
                      className={`asd-body flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold capitalize shadow-sm ${STATUS_STYLES[approvalStatus]}`}
                    >
                      <i className={`fa-solid ${STATUS_ICON[approvalStatus]} text-[11px]`}></i>
                      {approvalStatus}
                    </span>
                  </div>
                </div>
              )}

              <div className="p-4 sm:p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <h1 className="asd-display text-xl font-extrabold leading-tight sm:text-2xl lg:text-3xl">
                    {service.service_name}
                  </h1>
                  <span className="asd-display shrink-0 rounded-2xl bg-[#F97316]/10 px-4 py-1.5 text-lg font-extrabold text-[#F97316] sm:text-xl">
                    ₹{service.price}
                  </span>
                </div>

                <div className="mt-5 grid grid-cols-1 gap-3 border-t border-[#F1F5F9] pt-5 sm:grid-cols-2">
                  <StatBlock icon="fa-tags" label="Category" value={service.category?.category_name} />
                  {service.createdAt && (
                    <StatBlock
                      icon="fa-calendar-plus"
                      label="Submitted on"
                      value={new Date(service.createdAt).toLocaleDateString()}
                    />
                  )}
                  {service.updatedAt && (
                    <StatBlock
                      icon="fa-clock-rotate-left"
                      label="Last updated"
                      value={new Date(service.updatedAt).toLocaleDateString()}
                    />
                  )}
                  <StatBlock
                    icon="fa-toggle-on"
                    label="Vendor visibility"
                    value={service.status ? "Active" : "Inactive"}
                  />
                </div>

                {service.description && (
                  <div className="mt-5 border-t border-[#F1F5F9] pt-5">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-[#9CA3AF]">
                      Description
                    </p>
                    <p className="asd-body mt-1.5 whitespace-pre-line text-sm leading-relaxed text-[#4B5563]">
                      {service.description}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Vendor card */}
            <div className="asd-card border border-[#E5E7EB] bg-white p-4 shadow-[0_20px_50px_-32px_rgba(31,41,55,0.3)] sm:p-6">
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#F97316]/10 text-[#F97316]">
                  <i className="fa-solid fa-store text-sm"></i>
                </span>
                <div>
                  <h2 className="asd-display text-base font-extrabold leading-tight sm:text-lg">
                    Vendor details
                  </h2>
                  <p className="asd-body text-xs text-[#6B7280]">Who submitted this service</p>
                </div>
              </div>

              {!vendorApproved && (
                <div className="asd-body mt-4 flex items-start gap-2.5 rounded-2xl border border-yellow-200 bg-yellow-50 p-3.5 text-xs text-yellow-800">
                  <i className="fa-solid fa-triangle-exclamation mt-0.5 text-yellow-600"></i>
                  <span>
                    This vendor is not approved yet. Approve the vendor first — services from
                    unapproved vendors can't be approved.
                  </span>
                </div>
              )}

              <div className="mt-4 flex flex-col gap-3 rounded-2xl border border-[#E5E7EB] bg-[#F8FAFC] p-4 sm:flex-row sm:items-center">
                {service.vendor?.image ? (
                  <img
                    src={getImageUrl(service.vendor.image)}
                    alt=""
                    className="h-12 w-12 shrink-0 rounded-full border-2 border-white object-cover shadow-sm"
                  />
                ) : (
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#F97316]/15 text-[#F97316] shadow-sm">
                    <i className="fa-solid fa-store"></i>
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <p className="asd-body truncate text-sm font-semibold">
                    {service.vendor?.shop_name || service.vendor?.name || "Vendor"}
                  </p>
                  <p className="asd-body mt-0.5 truncate text-xs text-[#6B7280]">
                    {service.vendor?.email || "—"}
                  </p>
                </div>
                {service.vendor?.approvalStatus && (
                  <span
                    className={`asd-body flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold capitalize ${STATUS_STYLES[service.vendor.approvalStatus]}`}
                  >
                    <i className={`fa-solid ${STATUS_ICON[service.vendor.approvalStatus]} text-[11px]`}></i>
                    {service.vendor.approvalStatus}
                  </span>
                )}
                {service.vendor?._id && (
                  <button
                    onClick={() => navigate(`/admin/vendors/${service.vendor._id}`)}
                    className="asd-btn asd-chip asd-body w-full shrink-0 rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-xs font-semibold text-[#1F2937] hover:border-[#F97316] hover:text-[#F97316] sm:w-auto"
                  >
                    View vendor
                  </button>
                )}
              </div>

              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <StatBlock icon="fa-phone" label="Phone" value={service.vendor?.contact} />
                <StatBlock icon="fa-location-dot" label="Address" value={service.vendor?.address} />
              </div>
            </div>
          </div>

          {/* Sidebar actions */}
          <div className="lg:col-span-2">
            <div className="asd-card border border-[#E5E7EB] bg-white p-4 shadow-[0_20px_50px_-32px_rgba(31,41,55,0.35)] sm:p-6 lg:sticky lg:top-6">
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#F97316]/10 text-[#F97316]">
                  <i className="fa-solid fa-clipboard-check text-sm"></i>
                </span>
                <div>
                  <h2 className="asd-display text-base font-extrabold leading-tight sm:text-lg">
                    Review service
                  </h2>
                  <p className="asd-body text-xs text-[#6B7280]">Approve, reject, or remove</p>
                </div>
              </div>

              <div className="mt-5 flex flex-col gap-3">
                {approvalStatus === "pending" && (
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <button
                      disabled={updating}
                      onClick={handleApprove}
                      title={!vendorApproved ? "Vendor must be approved first" : undefined}
                      className="asd-btn asd-body flex flex-1 items-center justify-center gap-2 rounded-xl bg-green-50 px-4 py-3 text-sm font-semibold text-green-700 shadow-sm hover:bg-green-100"
                    >
                      {updating ? (
                        <i className="fa-solid fa-circle-notch asd-spin"></i>
                      ) : (
                        <i className="fa-solid fa-check"></i>
                      )}
                      Approve
                    </button>
                    <button
                      disabled={updating}
                      onClick={handleReject}
                      className="asd-btn asd-body flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600 shadow-sm hover:bg-red-100"
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
                    title={!vendorApproved ? "Vendor must be approved first" : undefined}
                    className="asd-btn asd-body flex items-center justify-center gap-2 rounded-xl bg-green-50 px-5 py-3 text-sm font-semibold text-green-700 shadow-sm hover:bg-green-100"
                  >
                    {updating ? (
                      <i className="fa-solid fa-circle-notch asd-spin"></i>
                    ) : (
                      <i className="fa-solid fa-check"></i>
                    )}
                    Approve service
                  </button>
                )}

                {approvalStatus === "approved" && (
                  <button
                    disabled={updating}
                    onClick={handleReject}
                    className="asd-btn asd-body flex items-center justify-center gap-2 rounded-xl bg-red-50 px-5 py-3 text-sm font-semibold text-red-600 shadow-sm hover:bg-red-100"
                  >
                    {updating ? (
                      <i className="fa-solid fa-circle-notch asd-spin"></i>
                    ) : (
                      <i className="fa-solid fa-xmark"></i>
                    )}
                    Reject service
                  </button>
                )}

                <button
                  onClick={handleDelete}
                  className="asd-btn asd-body flex items-center justify-center gap-2 rounded-xl border border-[#E5E7EB] px-5 py-3 text-sm font-semibold text-[#6B7280] hover:border-red-200 hover:bg-red-50 hover:text-red-500"
                >
                  <i className="fa-solid fa-trash"></i>
                  Delete service
                </button>

                <p className="asd-body flex items-center justify-center gap-1.5 text-center text-[11px] text-[#9CA3AF]">
                  <i className="fa-solid fa-lock text-[10px]"></i>
                  Only approved services appear on the customer site.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminServiceDetails;