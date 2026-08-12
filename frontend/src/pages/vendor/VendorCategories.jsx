import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";

const CATEGORY_API = `${process.env.REACT_APP_API_URL}/api/vendor`;
const SEARCH_DEBOUNCE_MS = 400;

const VendorCategories = () => {
  const { token } = useSelector((state) => state.auth || {});

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

  // Debounce the raw input so we don't fire a request on every keystroke,
  // just SEARCH_DEBOUNCE_MS after the user pauses typing.
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [search]);

  const fetchCategories = async ({ q } = {}) => {
    setLoading(true);
    try {
      const params = {};
      if (q) params.q = q;

      const res = await axios.get(`${CATEGORY_API}/all-categories`, {
        ...authHeaders,
        params,
      });
      setCategories(res.data.categories || []);
    } catch (error) {
      toast.error(error.response?.data?.msg || "Could not load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchCategories({ q: debouncedSearch });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, debouncedSearch]);

  return (
    <div className="vc-body text-[#1F2937]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=Inter:wght@400;500;600;700&display=swap');
        .vc-display { font-family: 'Sora', system-ui, sans-serif; }
        .vc-body { font-family: 'Inter', system-ui, sans-serif; }
        .vc-card { border-radius: 16px; transition: box-shadow 0.25s ease; }
        .vc-card:hover { box-shadow: 0 20px 40px -26px rgba(31,41,55,0.2); }
        .vc-input { transition: border-color 0.2s ease, box-shadow 0.2s ease; }
        .vc-input:focus { border-color: #F97316; box-shadow: 0 0 0 3px rgba(249,115,22,0.15); }
        @keyframes vcSpin { to { transform: rotate(360deg); } }
        .vc-spin { animation: vcSpin 0.8s linear infinite; }
      `}</style>

      <div>
        <h1 className="vc-display text-2xl font-extrabold sm:text-3xl">Categories</h1>
        <p className="vc-body mt-1 text-sm text-[#6B7280]">
          These categories are managed by the platform admin. Pick one when you add a service.
        </p>
      </div>

      <div className="mt-5">
        <div className="relative w-full sm:w-72">
          <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-[#9CA3AF]"></i>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search categories…"
            className="vc-input vc-body w-full rounded-xl border border-[#E5E7EB] py-2 pl-9 pr-9 text-sm outline-none"
          />
          {search !== debouncedSearch && (
            <i className="fa-solid fa-circle-notch vc-spin absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#F97316]"></i>
          )}
        </div>
      </div>

      <div className="vc-card mt-6 border border-[#E5E7EB] bg-white">
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-14 text-sm text-[#6B7280]">
            <i className="fa-solid fa-circle-notch vc-spin text-[#F97316]"></i>
            Loading categories…
          </div>
        ) : categories.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-14 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F8FAFC] text-[#F97316]">
              <i className="fa-solid fa-tags text-lg"></i>
            </span>
            <div>
              <p className="vc-body text-sm font-semibold">
                {debouncedSearch ? "No categories match your search" : "No categories available"}
              </p>
              <p className="vc-body mt-0.5 text-xs text-[#6B7280]">
                {debouncedSearch
                  ? "Try a different name."
                  : "Ask the admin to add categories so you can start listing services."}
              </p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-[#E5E7EB]">
            {categories.map((c) => (
              <div key={c._id} className="flex items-center gap-3 px-5 py-3.5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#F8FAFC] text-[#F97316]">
                  <i className={`fa-solid ${c.icon || "fa-tags"} text-sm`}></i>
                </span>
                <div className="min-w-0 flex-1">
                  <p className="vc-body truncate text-sm font-semibold">{c.category_name}</p>
                  <p className="vc-body truncate text-xs text-[#6B7280]">
                    {c.fields?.length || 0} custom field{c.fields?.length === 1 ? "" : "s"}
                  </p>
                </div>
                <span
                  className={`vc-body shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                    c.status ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {c.status ? "Active" : "Inactive"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default VendorCategories;