import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";

const USER_API = `${process.env.REACT_APP_API_URL}/api/user`;
const BASE_URL = process.env.REACT_APP_API_URL;

const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (/^https?:\/\//i.test(imagePath)) return imagePath;
  const cleanBase = BASE_URL?.replace(/\/$/, "") || "";
  const cleanPath = imagePath.replace(/^\//, "");
  return `${cleanBase}/${cleanPath}`;
};

const SingleService = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // ⚠️ ADJUST THIS: apne redux store ke actual slice/path se match karo.
  // Common patterns: state.auth.user, state.auth.token, state.user.currentUser
  const { user, token } = useSelector((state) => state.auth);
   

  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    customer_name: "",
    customer_phone: "",
    address: "",
    booking_date: "",
    booking_time: "",
    notes: "",
  });

  

  useEffect(() => {
   
    const fetchService = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${USER_API}/service/${id}`);
        setService(res.data.service || null);
      } catch (error) {
        toast.error(error.response?.data?.msg || "Could not load service");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchService();
    window.scrollTo(0, 0);
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Name: sirf alphabets aur spaces allow honge, numbers/special chars type nahi honge
    if (name === "customer_name") {
      const onlyAlpha = value.replace(/[^A-Za-z\s]/g, "");
      setForm((prev) => ({ ...prev, [name]: onlyAlpha }));
      return;
    }

    // Phone: sirf digits allow, max 10 digits ke baad type nahi hoga
    if (name === "customer_phone") {
      const onlyDigits = value.replace(/[^0-9]/g, "").slice(0, 10);
      setForm((prev) => ({ ...prev, [name]: onlyDigits }));
      return;
    }

    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleBooking = async (e) => {
    e.preventDefault();

    if (!form.customer_name || !form.customer_phone || !form.address || !form.booking_date) {
      toast.error("Please fill all required fields");
      return;
    }

    if (!/^[A-Za-z\s]+$/.test(form.customer_name.trim())) {
      toast.error("Name should only contain alphabets");
      return;
    }

    if (!/^[0-9]{10}$/.test(form.customer_phone)) {
      toast.error("Phone number must be exactly 10 digits");
      return;
    }

    setSubmitting(true);
    try {
      await axios.post(`${USER_API}/service/${id}/book`, form, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      toast.success("Booking request sent! Vendor will contact you soon.");
      setForm({
        customer_name: "",
        customer_phone: "",
        address: "",
        booking_date: "",
        booking_time: "",
        notes: "",
      });
    } catch (error) {
      toast.error(error.response?.data?.msg || "Could not send booking request");
    } finally {
      setSubmitting(false);
    }
  };

 

  if (loading) {
    return (
      <div className="sd-body flex min-h-screen items-center justify-center gap-2 bg-white text-sm text-[#6B7280]">
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=Inter:wght@400;500;600;700&display=swap');
          .sd-display { font-family: 'Sora', system-ui, sans-serif; }
          .sd-body { font-family: 'Inter', system-ui, sans-serif; }
          @keyframes sdSpin { to { transform: rotate(360deg); } }
          .sd-spin { animation: sdSpin 0.8s linear infinite; }
        `}</style>
        <i className="fa-solid fa-circle-notch sd-spin text-[#F97316]"></i>
        Loading service…
      </div>
    );
  }

  if (!service) {
    return (
      <div className="sd-body flex min-h-screen flex-col items-center justify-center gap-3 bg-white text-center">
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=Inter:wght@400;500;600;700&display=swap');
          .sd-display { font-family: 'Sora', system-ui, sans-serif; }
          .sd-body { font-family: 'Inter', system-ui, sans-serif; }
        `}</style>
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F8FAFC] text-[#F97316]">
          <i className="fa-solid fa-triangle-exclamation text-xl"></i>
        </span>
        <p className="sd-body text-sm font-semibold">Service not found</p>
        <button
          onClick={() => navigate("/services")}
          className="sd-body mt-1 rounded-xl bg-[#F97316] px-4 py-2 text-xs font-semibold text-white"
        >
          Browse services
        </button>
      </div>
    );
  }

  return (
    <div className="sd-body min-h-screen bg-[#F8FAFC] text-[#1F2937]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=Inter:wght@400;500;600;700&display=swap');
        .sd-display { font-family: 'Sora', system-ui, sans-serif; }
        .sd-body { font-family: 'Inter', system-ui, sans-serif; }
        .sd-card { border-radius: 20px; }
        .sd-input { transition: border-color 0.2s ease, box-shadow 0.2s ease; }
        .sd-input:focus { border-color: #F97316; box-shadow: 0 0 0 3px rgba(249,115,22,0.15); }
        .sd-cta-primary { background-color: #F97316; transition: background-color 0.2s ease, transform 0.2s ease; }
        .sd-cta-primary:hover { background-color: #EA580C; transform: translateY(-1px); }
        .sd-cta-primary:disabled { opacity: 0.6; transform: none; }
        .sd-back-btn { transition: background-color 0.2s ease, color 0.2s ease; }
        .sd-vendor-btn { transition: border-color 0.2s ease, color 0.2s ease, background-color 0.2s ease; }
        @keyframes sdSpin { to { transform: rotate(360deg); } }
        .sd-spin { animation: sdSpin 0.8s linear infinite; }
      `}</style>

      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        <button
          onClick={() => navigate(-1)}
          className="sd-back-btn sd-body mb-5 flex items-center gap-2 rounded-full bg-white px-3.5 py-2 text-xs font-semibold text-[#6B7280] shadow-sm hover:bg-[#F97316]/10 hover:text-[#F97316]"
        >
          <i className="fa-solid fa-arrow-left"></i>
          Back
        </button>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5 lg:gap-8">
          {/* LEFT: Service details */}
          <div className="lg:col-span-3">
            <div className="sd-card overflow-hidden border border-[#E5E7EB] bg-white shadow-[0_20px_45px_-30px_rgba(31,41,55,0.2)]">
              {service.image ? (
                <div className="relative w-full bg-[#F1F5F9]">
                  <div className="aspect-[4/3] w-full sm:aspect-[16/10]">
                    <img
                      src={getImageUrl(service.image)}
                      alt={service.service_name}
                      className="h-full w-full object-contain"
                    />
                  </div>
                  <span className="sd-body absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-[#F97316] shadow-sm">
                    {service.category?.category_name || "Service"}
                  </span>
                </div>
              ) : (
                <div className="flex aspect-[4/3] w-full items-center justify-center bg-[#F8FAFC] text-[#F97316] sm:aspect-[16/10]">
                  <i className={`fa-solid ${service.category?.icon || "fa-tags"} text-6xl`}></i>
                </div>
              )}

              <div className="p-5 sm:p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <h1 className="sd-display text-2xl font-extrabold leading-tight sm:text-3xl">
                    {service.service_name}
                  </h1>
                  <span className="sd-display shrink-0 rounded-2xl bg-[#F97316]/10 px-4 py-1.5 text-xl font-extrabold text-[#F97316]">
                    ₹{service.price}
                  </span>
                </div>

                {service.description && (
                  <div className="mt-5 border-t border-[#F1F5F9] pt-5">
                    <h3 className="sd-body text-sm font-semibold">Description</h3>
                    <p className="sd-body mt-1.5 text-sm leading-relaxed text-[#6B7280]">
                      {service.description}
                    </p>
                  </div>
                )}

                {/* Vendor info */}
                <div className="mt-5 flex items-center gap-3 rounded-2xl border border-[#E5E7EB] bg-[#F8FAFC] p-4">
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
                    <p className="sd-body truncate text-sm font-semibold">
                      {service.vendor?.shop_name || service.vendor?.name || "Vendor"}
                    </p>
                    {service.vendor?.address && (
                      <p className="sd-body mt-0.5 truncate text-xs text-[#6B7280]">
                        <i className="fa-solid fa-location-dot mr-1 text-[#F97316]"></i>
                        {service.vendor.address}
                      </p>
                    )}
                  </div>
                  {service.vendor?._id && (
                    <button
                      onClick={() => navigate(`/vendor-details/${service.vendor._id}`)}
                      className="sd-vendor-btn sd-body shrink-0 rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-xs font-semibold text-[#1F2937] hover:border-[#F97316] hover:text-[#F97316]"
                    >
                      View vendor
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Booking form */}
          <div className="lg:col-span-2">
            <div className="sd-card sticky top-6 border border-[#E5E7EB] bg-white p-5 shadow-[0_20px_45px_-30px_rgba(31,41,55,0.25)] sm:p-6">
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#F97316]/10 text-[#F97316]">
                  <i className="fa-solid fa-calendar-check text-sm"></i>
                </span>
                <div>
                  <h2 className="sd-display text-lg font-extrabold leading-tight">Book this service</h2>
                  <p className="sd-body text-xs text-[#6B7280]">Vendor will confirm shortly</p>
                </div>
              </div>

              <form onSubmit={handleBooking} className="mt-5 flex flex-col gap-3.5">
                <div>
                  <label className="sd-body text-xs font-semibold text-[#6B7280]">Full name *</label>
                  <input
                    type="text"
                    name="customer_name"
                    value={form.customer_name}
                    onChange={handleChange}
                    placeholder="Your name"
                    className="sd-input sd-body mt-1.5 w-full rounded-xl border border-[#E5E7EB] px-3.5 py-2.5 text-sm outline-none"
                  />
                </div>

                <div>
                  <label className="sd-body text-xs font-semibold text-[#6B7280]">Phone number *</label>
                  <input
                    type="tel"
                    name="customer_phone"
                    value={form.customer_phone}
                    onChange={handleChange}
                    placeholder="10-digit mobile number"
                    inputMode="numeric"
                    maxLength={10}
                    className="sd-input sd-body mt-1.5 w-full rounded-xl border border-[#E5E7EB] px-3.5 py-2.5 text-sm outline-none"
                  />
                </div>

                <div>
                  <label className="sd-body text-xs font-semibold text-[#6B7280]">Address *</label>
                  <textarea
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    placeholder="Where should the vendor come?"
                    rows={2}
                    className="sd-input sd-body mt-1.5 w-full resize-none rounded-xl border border-[#E5E7EB] px-3.5 py-2.5 text-sm outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="sd-body text-xs font-semibold text-[#6B7280]">Date *</label>
                    <input
                      type="date"
                      name="booking_date"
                      value={form.booking_date}
                      onChange={handleChange}
                      min={new Date().toISOString().split("T")[0]}
                      className="sd-input sd-body mt-1.5 w-full rounded-xl border border-[#E5E7EB] px-3.5 py-2.5 text-sm outline-none"
                    />
                  </div>
                  <div>
                    <label className="sd-body text-xs font-semibold text-[#6B7280]">Time</label>
                    <input
                      type="time"
                      name="booking_time"
                      value={form.booking_time}
                      onChange={handleChange}
                      className="sd-input sd-body mt-1.5 w-full rounded-xl border border-[#E5E7EB] px-3.5 py-2.5 text-sm outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="sd-body text-xs font-semibold text-[#6B7280]">Notes (optional)</label>
                  <textarea
                    name="notes"
                    value={form.notes}
                    onChange={handleChange}
                    placeholder="Any specific instructions"
                    rows={2}
                    className="sd-input sd-body mt-1.5 w-full resize-none rounded-xl border border-[#E5E7EB] px-3.5 py-2.5 text-sm outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="sd-cta-primary sd-body mt-1.5 flex items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-sm font-semibold text-white"
                >
                  {submitting ? (
                    <>
                      <i className="fa-solid fa-circle-notch sd-spin"></i>
                      Booking…
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-calendar-check"></i>
                      Book now
                    </>
                  )}
                </button>

                <p className="sd-body flex items-center justify-center gap-1.5 text-center text-[11px] text-[#9CA3AF]">
                  <i className="fa-solid fa-lock text-[10px]"></i>
                  Your details are only shared with this vendor.
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SingleService;