import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

const SERVICE_API = `${process.env.REACT_APP_API_URL}/api/vendor-service`;
const BASE_URL = process.env.REACT_APP_API_URL;

const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (/^https?:\/\//i.test(imagePath)) return imagePath;
  const cleanBase = BASE_URL?.replace(/\/$/, "") || "";
  const cleanPath = imagePath.replace(/^\//, "");
  return `${cleanBase}/${cleanPath}`;
};

const APPROVAL_STYLES = {
  pending: "bg-yellow-50 text-yellow-600",
  approved: "bg-green-50 text-green-600",
  rejected: "bg-red-50 text-red-500",
};

const APPROVAL_MESSAGES = {
  pending: "This service is waiting for admin approval and is not visible to customers yet.",
  approved: "This service is approved and visible to customers.",
  rejected: "This service was rejected by the admin and is not visible to customers.",
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
    .ap-status-toggle { transition: background-color 0.2s ease, color 0.2s ease; }
    .ap-danger-btn { transition: background-color 0.2s ease, color 0.2s ease; }
    @keyframes apSpin { to { transform: rotate(360deg); } }
    .ap-spin { animation: apSpin 0.8s linear infinite; }
  `}</style>
);

const VendorServiceDetails = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { token } = useSelector((state) => state.auth || {});

  const [service, setService] = useState(location.state?.service || null);
  const [loading, setLoading] = useState(!location.state?.service);
  const [updating, setUpdating] = useState(false);

  const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

  const fetchService = async () => {
    setLoading(true);
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
    if (!service && token) fetchService();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, token]);

  const handleToggleStatus = async () => {
    if (!service) return;
    const nextStatus = !service.status;
    setUpdating(true);
    setService((prev) => ({ ...prev, status: nextStatus }));

    try {
      await axios.put(
        `${SERVICE_API}/update-service-status/${service._id}`,
        { status: nextStatus },
        authHeaders
      );
      toast.success("Service status updated");
    } catch (error) {
      setService((prev) => ({ ...prev, status: !nextStatus }));
      toast.error(error.response?.data?.msg || "Could not update status");
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    const result = await Swal.fire({
      title: `Delete "${service.service_name}"?`,
      text: "This can't be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
      confirmButtonColor: "#DC2626",
    });
    if (!result.isConfirmed) return;

    try {
      await axios.delete(`${SERVICE_API}/delete-service/${service._id}`, authHeaders);
      toast.success("Service deleted");
      navigate("/vendor/services");
    } catch (error) {
      toast.error(error.response?.data?.msg || "Could not delete service");
    }
  };

  if (loading) {
    return (
      <div className="ap-body flex min-h-screen items-center justify-center gap-2 bg-[#F8FAFC] text-sm text-[#6B7280]">
        <ApStyles />
        <i className="fa-solid fa-circle-notch ap-spin text-[#F97316]"></i>
        Loading service…
      </div>
    );
  }

  if (!service) {
    return (
      <div className="ap-body flex min-h-screen flex-col items-center justify-center gap-3 bg-[#F8FAFC] text-center">
        <ApStyles />
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-[#F97316]">
          <i className="fa-solid fa-triangle-exclamation text-xl"></i>
        </span>
        <p className="ap-body text-sm font-semibold">Service not found</p>
        <button
          onClick={() => navigate("/vendor/services")}
          className="ap-body mt-1 rounded-xl bg-[#F97316] px-4 py-2 text-xs font-semibold text-white"
        >
          Back to services
        </button>
      </div>
    );
  }

  const approvalStatus = service.approvalStatus || "pending";

  return (
    <div className="ap-body min-h-screen bg-[#F8FAFC] text-[#1F2937]">
      <ApStyles />

      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        <button
          onClick={() => navigate("/vendor/services")}
          className="ap-back-btn ap-body mb-5 flex items-center gap-2 rounded-full bg-white px-3.5 py-2 text-xs font-semibold text-[#6B7280] shadow-sm hover:bg-[#F97316]/10 hover:text-[#F97316]"
        >
          <i className="fa-solid fa-arrow-left"></i>
          Back
        </button>

        <div
          className={`ap-body mb-5 flex items-center gap-2.5 rounded-2xl border px-4 py-3 text-xs font-semibold ${
            approvalStatus === "approved"
              ? "border-green-100 bg-green-50 text-green-700"
              : approvalStatus === "rejected"
              ? "border-red-100 bg-red-50 text-red-600"
              : "border-yellow-100 bg-yellow-50 text-yellow-700"
          }`}
        >
          <i
            className={`fa-solid ${
              approvalStatus === "approved"
                ? "fa-circle-check"
                : approvalStatus === "rejected"
                ? "fa-circle-xmark"
                : "fa-hourglass-half"
            }`}
          ></i>
          {APPROVAL_MESSAGES[approvalStatus]}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5 lg:gap-8">
          <div className="lg:col-span-3">
            <div className="ap-card overflow-hidden border border-[#E5E7EB] bg-white shadow-[0_20px_45px_-30px_rgba(31,41,55,0.2)]">
              {service.image ? (
                <div className="relative w-full bg-[#F1F5F9]">
                  <div className="aspect-[4/3] w-full sm:aspect-[16/10]">
                    <img
                      src={getImageUrl(service.image)}
                      alt={service.service_name}
                      className="h-full w-full object-contain"
                    />
                  </div>
                  <span
                    className={`ap-body absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-semibold shadow-sm ${
                      service.status ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {service.status ? "Active" : "Inactive"}
                  </span>
                  <span
                    className={`ap-body absolute right-3 top-3 rounded-full px-3 py-1 text-xs font-semibold capitalize shadow-sm ${APPROVAL_STYLES[approvalStatus]}`}
                  >
                    {approvalStatus}
                  </span>
                </div>
              ) : (
                <div className="relative flex aspect-[4/3] w-full items-center justify-center bg-[#F8FAFC] text-[#F97316] sm:aspect-[16/10]">
                  <i className={`fa-solid ${service.category?.icon || "fa-tags"} text-6xl`}></i>
                  <span
                    className={`ap-body absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-semibold shadow-sm ${
                      service.status ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {service.status ? "Active" : "Inactive"}
                  </span>
                  <span
                    className={`ap-body absolute right-3 top-3 rounded-full px-3 py-1 text-xs font-semibold capitalize shadow-sm ${APPROVAL_STYLES[approvalStatus]}`}
                  >
                    {approvalStatus}
                  </span>
                </div>
              )}

              <div className="p-5 sm:p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <h1 className="ap-display text-2xl font-extrabold leading-tight sm:text-3xl">
                    {service.service_name}
                  </h1>
                  <span className="ap-display shrink-0 rounded-2xl bg-[#F97316]/10 px-4 py-1.5 text-xl font-extrabold text-[#F97316]">
                    ₹{service.price}
                  </span>
                </div>

                <div className="mt-5 grid grid-cols-1 gap-4 border-t border-[#F1F5F9] pt-5 sm:grid-cols-2">
                  <div>
                    <p className="ap-body text-xs font-semibold uppercase tracking-wide text-[#9CA3AF]">
                      Category
                    </p>
                    <p className="ap-body mt-1 text-sm font-semibold">
                      {service.category?.category_name || "—"}
                    </p>
                  </div>
                  {service.duration && (
                    <div>
                      <p className="ap-body text-xs font-semibold uppercase tracking-wide text-[#9CA3AF]">
                        Duration
                      </p>
                      <p className="ap-body mt-1 text-sm font-semibold">{service.duration}</p>
                    </div>
                  )}
                  {service.createdAt && (
                    <div>
                      <p className="ap-body text-xs font-semibold uppercase tracking-wide text-[#9CA3AF]">
                        Created on
                      </p>
                      <p className="ap-body mt-1 text-sm font-semibold">
                        {new Date(service.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                  {service.updatedAt && (
                    <div>
                      <p className="ap-body text-xs font-semibold uppercase tracking-wide text-[#9CA3AF]">
                        Last updated
                      </p>
                      <p className="ap-body mt-1 text-sm font-semibold">
                        {new Date(service.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                  {service.description && (
                    <div className="sm:col-span-2">
                      <p className="ap-body text-xs font-semibold uppercase tracking-wide text-[#9CA3AF]">
                        Description
                      </p>
                      <p className="ap-body mt-1 whitespace-pre-line text-sm text-[#4B5563]">
                        {service.description}
                      </p>
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
                  <i className="fa-solid fa-screwdriver-wrench text-sm"></i>
                </span>
                <div>
                  <h2 className="ap-display text-lg font-extrabold leading-tight">Manage service</h2>
                  <p className="ap-body text-xs text-[#6B7280]">Edit, toggle, or remove this service</p>
                </div>
              </div>

              <div className="mt-5 flex flex-col gap-3.5">
                <button
                  disabled={updating}
                  onClick={handleToggleStatus}
                  className={`ap-status-toggle ap-body flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold ${
                    service.status
                      ? "bg-green-50 text-green-600 hover:bg-green-100"
                      : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                  }`}
                >
                  {updating ? (
                    <i className="fa-solid fa-circle-notch ap-spin"></i>
                  ) : (
                    <i className={`fa-solid ${service.status ? "fa-toggle-on" : "fa-toggle-off"}`}></i>
                  )}
                  {service.status ? "Active — tap to deactivate" : "Inactive — tap to activate"}
                </button>

                <button
                  onClick={() => navigate(`/vendor/services/edit/${service._id}`)}
                  className="ap-cta-primary ap-body flex items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-sm font-semibold text-white"
                >
                  <i className="fa-solid fa-pen"></i>
                  Edit service
                </button>

                <button
                  onClick={handleDelete}
                  className="ap-danger-btn ap-body flex items-center justify-center gap-2 rounded-xl border border-[#E5E7EB] px-5 py-3 text-sm font-semibold text-[#6B7280] hover:bg-red-50 hover:text-red-500"
                >
                  <i className="fa-solid fa-trash"></i>
                  Delete service
                </button>

                <p className="ap-body flex items-center justify-center gap-1.5 text-center text-[11px] text-[#9CA3AF]">
                  <i className="fa-solid fa-lock text-[10px]"></i>
                  Editing this service will send it back for admin approval.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorServiceDetails;