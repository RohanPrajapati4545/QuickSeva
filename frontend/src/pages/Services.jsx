import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
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

function useDebouncedValue(value, delay = 400) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}

const Services = () => {
  const navigate = useNavigate();
  const { categorySlug } = useParams();
  const [searchParams] = useSearchParams();
   const { user, token } = useSelector((state) => state.auth || {});
   const isLoggedIn = Boolean(user || token)
  

  const [categories, setCategories] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  const [location, setLocation] = useState(searchParams.get("location") || "");

  const debouncedLocation = useDebouncedValue(location, 400);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get(`${USER_API}/categories`);
        setCategories(res.data.categories || []);
      } catch (error) {
        console.log(error);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    let cancelled = false;
    const fetchServices = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${USER_API}/services`, {
          params: {
            category: categorySlug || undefined,
            location: debouncedLocation || undefined,
          },
        });
        if (!cancelled) setServices(res.data.services || []);
      } catch (error) {
        if (!cancelled) toast.error(error.response?.data?.msg || "Could not load services");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchServices();
    return () => {
      cancelled = true;
    };
  }, [categorySlug, debouncedLocation]);

  const handleSearch = (e) => {
    e.preventDefault();
  };

  
  const handleServiceClick = (serviceId) => {
      if (!isLoggedIn) {
          toast.error("Please login first");
          return;
        }
    navigate(`/service/${serviceId}`);
  };

  const activeCategory = categories.find((c) => c.slug === categorySlug);

  return (
    <div className="sv-body min-h-screen bg-white text-[#1F2937]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=Inter:wght@400;500;600;700&display=swap');
        .sv-display { font-family: 'Sora', system-ui, sans-serif; }
        .sv-body { font-family: 'Inter', system-ui, sans-serif; }
        .sv-card { border-radius: 16px; transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease; }
        .sv-card:hover { transform: translateY(-3px); box-shadow: 0 20px 40px -24px rgba(31,41,55,0.2); border-color: #F97316; }
        .sv-chip { transition: background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease; }
        .sv-cta-primary { background-color: #F97316; transition: background-color 0.2s ease; }
        .sv-cta-primary:hover { background-color: #EA580C; }
        @keyframes svSpin { to { transform: rotate(360deg); } }
        .sv-spin { animation: svSpin 0.8s linear infinite; }
      `}</style>

      <section className="bg-[#F8FAFC] px-4 py-10 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <span className="sv-body text-xs font-bold uppercase tracking-[0.2em] text-[#F97316]">
            {activeCategory ? activeCategory.category_name : "Browse"}
          </span>
          <h1 className="sv-display mt-1 text-2xl font-extrabold sm:text-3xl">
            {activeCategory ? `${activeCategory.category_name} services near you` : "All services"}
          </h1>

          <form
            onSubmit={handleSearch}
            className="sv-card mt-6 flex flex-col gap-2 rounded-2xl border border-[#E5E7EB] bg-white p-3 shadow-[0_16px_36px_-24px_rgba(31,41,55,0.2)] sm:flex-row sm:items-center sm:gap-0 sm:p-2"
          >
            <label className="flex flex-1 items-center gap-3 rounded-xl px-3 py-2.5">
              <i className="fa-solid fa-location-dot text-[#F97316]"></i>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Search by location"
                className="sv-body w-full bg-transparent text-sm outline-none placeholder:text-[#9CA3AF]"
              />
            </label>
            <button type="submit" className="sv-cta-primary sv-body shrink-0 rounded-xl px-6 py-3 text-sm font-semibold text-white">
              Search
            </button>
          </form>

          <div className="mt-5 flex flex-wrap gap-2">
            <span
              onClick={() => navigate("/services")}
              className={`sv-chip sv-body cursor-pointer rounded-full border px-4 py-1.5 text-xs font-semibold ${
                !categorySlug ? "border-[#F97316] bg-[#F97316] text-white" : "border-[#E5E7EB] text-[#6B7280] hover:border-[#F97316]"
              }`}
            >
              All
            </span>
            {categories.map((c) => (
              <span
                key={c.slug}
                onClick={() => navigate(`/services/${c.slug}`)}
                className={`sv-chip sv-body cursor-pointer rounded-full border px-4 py-1.5 text-xs font-semibold ${
                  categorySlug === c.slug ? "border-[#F97316] bg-[#F97316] text-white" : "border-[#E5E7EB] text-[#6B7280] hover:border-[#F97316]"
                }`}
              >
                <i className={`fa-solid ${c.icon} mr-1.5`}></i>
                {c.category_name}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-10 sm:px-6">
        <div className="mx-auto max-w-7xl">
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-20 text-sm text-[#6B7280]">
              <i className="fa-solid fa-circle-notch sv-spin text-[#F97316]"></i>
              Loading services…
            </div>
          ) : services.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F8FAFC] text-[#F97316]">
                <i className="fa-solid fa-magnifying-glass text-xl"></i>
              </span>
              <div>
                <p className="sv-body text-sm font-semibold">No services found</p>
                <p className="sv-body mt-0.5 text-xs text-[#6B7280]">Try a different category or location.</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {services.map((s) => (
                <div
                  key={s._id}
                  onClick={() => handleServiceClick(s._id)}
                  className="sv-card cursor-pointer border border-[#E5E7EB] bg-white p-4"
                >
                  {s.image ? (
                    <img src={getImageUrl(s.image)} alt="" className="h-36 w-full rounded-xl object-cover" />
                  ) : (
                    <div className="flex h-36 w-full items-center justify-center rounded-xl bg-[#F8FAFC] text-[#F97316]">
                      <i className={`fa-solid ${s.category?.icon || "fa-tags"} text-3xl`}></i>
                    </div>
                  )}

                  <div className="mt-3 flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="sv-display truncate text-sm font-bold text-[#1F2937]">{s.service_name}</h3>
                      <p className="sv-body mt-0.5 text-xs text-[#6B7280]">{s.category?.category_name}</p>
                    </div>
                    <span className="sv-display shrink-0 text-sm font-extrabold text-[#F97316]">₹{s.price}</span>
                  </div>

                  {s.description && (
                    <p className="sv-body mt-2 line-clamp-2 text-xs text-[#6B7280]">{s.description}</p>
                  )}

                  <div className="mt-3 flex items-center gap-2 border-t border-[#E5E7EB] pt-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#F97316]/15 text-[#F97316]">
                      <i className="fa-solid fa-store text-[11px]"></i>
                    </span>
                    <span className="sv-body truncate text-xs font-semibold text-[#1F2937]">
                      {s.vendor?.shop_name || s.vendor?.name || "Vendor"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Services;