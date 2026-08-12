import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { login } from "./../Redux/AuthSlice";

const EMAIL_REGEX = /^[a-zA-Z0-9]+@[a-zA-Z0-9]+\.[a-zA-Z]{2,}$/;
const MAX_PASSWORD_LENGTH = 15;

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { token, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleEmailChange = (e) => {
    setEmail(e.target.value.replace(/[^a-zA-Z0-9@.]/g, ""));
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value.slice(0, MAX_PASSWORD_LENGTH));
  };

  const loginUser = async (e) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      return toast.error("All fields are required");
    }
    if (!EMAIL_REGEX.test(email)) {
      return toast.error("Please enter a valid email address");
    }

    setLoading(true);
    try {
      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/auth/login`,
        { email, password }
      );

      dispatch(login({ token: res.data.token, user: res.data.user }));
      toast.success(res.data.msg || "You have logged in");

      setEmail("");
      setPassword("");
    } catch (error) {
      toast.error(error.response?.data?.msg || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  // Route each role to its own home base after login.
  // vendor -> vendor dashboard, admin -> admin dashboard, everyone else -> "/"
  useEffect(() => {
    if (!token) return;
    if (user?.role === "vendor") navigate("/vendor/dashboard");
    else if (user?.role === "admin") navigate("/admin/dashboard");
    else navigate("/");
  }, [token, user, navigate]);

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
          Good to see you again.
        </h1>
        <p className="qs-body mt-1.5 text-xs text-[#6B7280] sm:text-sm">
          Your bookings and trusted professionals are right where you left them.
        </p>

        <form onSubmit={loginUser} className="mt-6 space-y-3">
          <div>
            <label className="qs-body mb-1 block text-[11px] font-semibold uppercase tracking-wide text-[#6B7280]">
              Email
            </label>
            <div className="qs-input flex items-center gap-2.5 rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] px-3.5 py-2.5">
              <i className="fa-solid fa-envelope text-xs text-[#9CA3AF]"></i>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={handleEmailChange}
                className="qs-body w-full bg-transparent text-sm text-[#1F2937] outline-none placeholder:text-[#9CA3AF]"
              />
            </div>
          </div>

          <div>
            <label className="qs-body mb-1 block text-[11px] font-semibold uppercase tracking-wide text-[#6B7280]">
              Password
            </label>
            <div className="qs-input flex items-center gap-2.5 rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] px-3.5 py-2.5">
              <i className="fa-solid fa-lock text-xs text-[#9CA3AF]"></i>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                maxLength={MAX_PASSWORD_LENGTH}
                onChange={handlePasswordChange}
                className="qs-body w-full bg-transparent text-sm text-[#1F2937] outline-none placeholder:text-[#9CA3AF]"
              />
              <i
                onClick={() => setShowPassword((prev) => !prev)}
                className={`fa-solid ${showPassword ? "fa-eye-slash" : "fa-eye"} cursor-pointer text-xs text-[#9CA3AF] hover:text-[#F97316]`}
              ></i>
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
                Signing in…
              </span>
            ) : (
              "Sign in"
            )}
          </button>
        </form>

        <p className="qs-body mt-6 text-center text-xs text-[#6B7280] sm:text-sm">
          Don't have an account?{" "}
          <span
            onClick={() => navigate("/register")}
            className="cursor-pointer font-semibold text-[#F97316] underline underline-offset-4"
          >
            Sign up
          </span>
        </p>
      </div>
    </div>
  );
};

export default Login;