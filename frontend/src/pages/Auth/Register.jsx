import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { useSelector } from "react-redux";

const EMAIL_REGEX = /^[a-zA-Z0-9]+@[a-zA-Z0-9]+\.[a-zA-Z]{2,}$/;
const PHONE_REGEX = /^[6-9]\d{9}$/; // 10-digit Indian mobile number
const MIN_PASSWORD_LENGTH = 6;
const MAX_PASSWORD_LENGTH = 20;

// Service categories a "Professional" can pick from at signup.
// NOTE: your current UserSchema only stores name/email/password/contact/
// image/role — if you want this saved, add a `service` field to the
// schema and read req.body.service in AuthController.register.
const SERVICE_OPTIONS = [
  "Electrician",
  "Plumber",
  "Carpenter",
  "Laptop Repair",
  "Painter",
  "Other",
];

const Register = () => {
  const navigate = useNavigate();
  const { token } = useSelector((state) => state.auth);

  const [accountType, setAccountType] = useState("customer"); // "customer" | "vendor"
  const [form, setForm] = useState({
    name: "",
    email: "",
    contact: "",
    password: "",
    confirm_password: "",
    service: "",
  });
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) navigate("/bookings");
  }, [token, navigate]);

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      return toast.error("Please select a valid image file");
    }
    if (file.size > 3 * 1024 * 1024) {
      return toast.error("Image must be under 3MB");
    }

    setImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const validate = () => {
    const next = {};

    if (!form.name.trim()) next.name = "Name is required";
    else if (form.name.trim().length < 2) next.name = "Name is too short";

    if (!form.email.trim()) next.email = "Email is required";
    else if (!EMAIL_REGEX.test(form.email)) next.email = "Enter a valid email address";

    if (!form.contact.trim()) next.contact = "Contact number is required";
    else if (!PHONE_REGEX.test(form.contact)) next.contact = "Enter a valid 10-digit mobile number";

    if (!form.password) next.password = "Password is required";
    else if (form.password.length < MIN_PASSWORD_LENGTH)
      next.password = `Password must be at least ${MIN_PASSWORD_LENGTH} characters`;

    if (!form.confirm_password) next.confirm_password = "Please confirm your password";
    else if (form.confirm_password !== form.password)
      next.confirm_password = "Passwords do not match";

    if (accountType === "vendor" && !form.service)
      next.service = "Select the service you provide";

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!validate()) {
      return toast.error("Please fix the highlighted fields");
    }

    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("name", form.name.trim());
      fd.append("email", form.email.trim());
      fd.append("contact", form.contact.trim());
      fd.append("password", form.password);
      fd.append("confirm_password", form.confirm_password);
      fd.append("role", accountType === "vendor" ? "vendor" : "customer");
      if (accountType === "vendor") fd.append("service", form.service);
      if (image) fd.append("image", image);

      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/auth/register`,
        fd,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      await Swal.fire({
        icon: "success",
        title: "Account created",
        text: res.data.msg || "You can now sign in",
        confirmButtonColor: "#F97316",
      });

      navigate("/login");
    } catch (error) {
      toast.error(error.response?.data?.msg || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const wrapClasses = (field) =>
    `qs-input flex items-center gap-2.5 rounded-xl border bg-[#F8FAFC] px-3.5 py-2.5 ${
      errors[field] ? "border-red-400" : "border-[#E5E7EB]"
    }`;

  const fieldClasses = () =>
    "qs-body w-full bg-transparent text-sm text-[#1F2937] outline-none placeholder:text-[#9CA3AF]";

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#F8FAFC] px-4 py-8">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=Inter:wght@400;500;600;700&display=swap');
        .qs-display { font-family: 'Sora', system-ui, sans-serif; }
        .qs-body { font-family: 'Inter', system-ui, sans-serif; }

        @keyframes qsFadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .qs-fade-up { opacity: 0; animation: qsFadeUp 0.6s cubic-bezier(0.16,1,0.3,1) forwards; }

        .qs-card {
          border-radius: 16px;
          transition: box-shadow 0.3s ease, border-color 0.3s ease;
        }

        .qs-input {
          transition: border-color 0.25s ease, background-color 0.25s ease;
        }
        .qs-input:focus-within {
          border-color: #F97316;
          background-color: #FFFFFF;
        }

        .qs-toggle-btn {
          transition: background-color 0.25s ease, color 0.25s ease;
        }

        .qs-cta-primary {
          background-color: #F97316;
          transition: background-color 0.25s ease, transform 0.25s ease, box-shadow .25s ease;
          box-shadow: 0 14px 28px -14px rgba(249,115,22,0.55);
        }
        .qs-cta-primary:hover { background-color: #EA580C; transform: translateY(-1px); }
        .qs-cta-primary:disabled { opacity: 0.6; transform: none; }

        @media (prefers-reduced-motion: reduce) {
          .qs-fade-up { animation: none !important; opacity: 1 !important; transform: none !important; }
        }
      `}</style>

      <div
        className="qs-fade-up qs-card w-full max-w-sm border border-[#E5E7EB] bg-white p-6 shadow-[0_20px_45px_-25px_rgba(31,41,55,0.25)] sm:p-7"
        style={{ animationDelay: "0.05s" }}
      >
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#F97316]/15 text-[#F97316]">
            <i className="fa-solid fa-screwdriver-wrench text-sm"></i>
          </div>
          <span className="qs-body text-xs font-bold uppercase tracking-[0.2em] text-[#F97316]">
            QuickSeva
          </span>
        </div>

        <h1 className="qs-display mt-4 text-xl font-extrabold text-[#1F2937] sm:text-2xl">
          Create your account
        </h1>
        <p className="qs-body mt-1.5 text-xs text-[#6B7280] sm:text-sm">
          Join the network in under a minute.
        </p>

        {/* ============== ACCOUNT TYPE ============== */}
        <div className="mt-4 grid grid-cols-2 gap-1.5 rounded-xl bg-[#F1F5F9] p-1">
          <button
            type="button"
            onClick={() => setAccountType("customer")}
            className={`qs-toggle-btn qs-body rounded-lg py-2 text-xs font-semibold ${
              accountType === "customer"
                ? "bg-[#1F2937] text-white"
                : "text-[#6B7280] hover:text-[#1F2937]"
            }`}
          >
            Book a service
          </button>
          <button
            type="button"
            onClick={() => setAccountType("vendor")}
            className={`qs-toggle-btn qs-body rounded-lg py-2 text-xs font-semibold ${
              accountType === "vendor"
                ? "bg-[#1F2937] text-white"
                : "text-[#6B7280] hover:text-[#1F2937]"
            }`}
          >
            Offer a service
          </button>
        </div>

        <form onSubmit={handleRegister} className="mt-5 space-y-3" noValidate>
          <div className="flex items-center gap-3">
            <label className="h-10 w-10 shrink-0 cursor-pointer rounded-full border border-dashed border-[#D1D5DB] flex items-center justify-center overflow-hidden bg-[#F8FAFC]">
              {imagePreview ? (
                <img src={imagePreview} alt="" className="h-full w-full object-cover" />
              ) : (
                <i className="fa-solid fa-camera text-xs text-[#9CA3AF]"></i>
              )}
              <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
            </label>
            <span className="qs-body text-[11px] text-[#6B7280]">
              Add a profile photo (optional)
            </span>
          </div>

          <div>
            <div className={wrapClasses("name")}>
              <i className="fa-solid fa-user text-xs text-[#9CA3AF]"></i>
              <input
                type="text"
                placeholder="Full name"
                value={form.name}
                onChange={handleChange("name")}
                className={fieldClasses()}
              />
            </div>
            {errors.name && <p className="qs-body mt-1 text-[11px] text-red-500">{errors.name}</p>}
          </div>

          <div>
            <div className={wrapClasses("email")}>
              <i className="fa-solid fa-envelope text-xs text-[#9CA3AF]"></i>
              <input
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange("email")}
                className={fieldClasses()}
              />
            </div>
            {errors.email && <p className="qs-body mt-1 text-[11px] text-red-500">{errors.email}</p>}
          </div>

          <div>
            <div className={wrapClasses("contact")}>
              <i className="fa-solid fa-phone text-xs text-[#9CA3AF]"></i>
              <input
                type="tel"
                inputMode="numeric"
                placeholder="10-digit mobile number"
                value={form.contact}
                maxLength={10}
                onChange={(e) => {
                  const digitsOnly = e.target.value.replace(/\D/g, "");
                  setForm((prev) => ({ ...prev, contact: digitsOnly }));
                  setErrors((prev) => ({ ...prev, contact: "" }));
                }}
                className={fieldClasses()}
              />
            </div>
            {errors.contact && <p className="qs-body mt-1 text-[11px] text-red-500">{errors.contact}</p>}
          </div>

          {accountType === "vendor" && (
            <div>
              <div className={wrapClasses("service")}>
                <i className="fa-solid fa-toolbox text-xs text-[#9CA3AF]"></i>
                <select
                  value={form.service}
                  onChange={handleChange("service")}
                  className={`${fieldClasses()} cursor-pointer`}
                >
                  <option value="">Select a service</option>
                  {SERVICE_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              {errors.service && <p className="qs-body mt-1 text-[11px] text-red-500">{errors.service}</p>}
            </div>
          )}

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <div className={wrapClasses("password")}>
                <i className="fa-solid fa-lock text-xs text-[#9CA3AF]"></i>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={form.password}
                  maxLength={MAX_PASSWORD_LENGTH}
                  onChange={handleChange("password")}
                  className={fieldClasses()}
                />
                <i
                  onClick={() => setShowPassword((p) => !p)}
                  className={`fa-solid ${showPassword ? "fa-eye-slash" : "fa-eye"} cursor-pointer text-xs text-[#9CA3AF] hover:text-[#F97316]`}
                ></i>
              </div>
              {errors.password && <p className="qs-body mt-1 text-[11px] text-red-500">{errors.password}</p>}
            </div>

            <div>
              <div className={wrapClasses("confirm_password")}>
                <i className="fa-solid fa-lock text-xs text-[#9CA3AF]"></i>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm password"
                  value={form.confirm_password}
                  maxLength={MAX_PASSWORD_LENGTH}
                  onChange={handleChange("confirm_password")}
                  className={fieldClasses()}
                />
                <i
                  onClick={() => setShowConfirmPassword((p) => !p)}
                  className={`fa-solid ${showConfirmPassword ? "fa-eye-slash" : "fa-eye"} cursor-pointer text-xs text-[#9CA3AF] hover:text-[#F97316]`}
                ></i>
              </div>
              {errors.confirm_password && (
                <p className="qs-body mt-1 text-[11px] text-red-500">{errors.confirm_password}</p>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="qs-cta-primary qs-body mt-1 w-full rounded-xl py-2.5 text-sm font-semibold text-white"
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <i className="fa-solid fa-circle-notch fa-spin"></i>
                Creating account…
              </span>
            ) : (
              "Create account"
            )}
          </button>
        </form>

        <p className="qs-body mt-5 text-center text-xs text-[#6B7280] sm:text-sm">
          Already have an account?{" "}
          <span
            onClick={() => navigate("/login")}
            className="cursor-pointer font-semibold text-[#F97316] underline underline-offset-4"
          >
            Sign in
          </span>
        </p>
      </div>
    </div>
  );
};

export default Register;