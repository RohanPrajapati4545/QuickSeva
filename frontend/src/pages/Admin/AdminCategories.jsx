import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

const CATEGORY_API = `${process.env.REACT_APP_API_URL}/api/admin/categories`;
const SEARCH_DEBOUNCE_MS = 400;
const PAGE_SIZE = 20;

const AdminCategories = () => {
  const { token } = useSelector((state) => state.auth || {});
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });

  const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [search]);

  // Reset to page 1 whenever the search term changes.
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const fetchCategories = async ({ q, pageNum } = {}) => {
    setLoading(true);
    try {
      const params = { page: pageNum || 1, limit: PAGE_SIZE };
      if (q) params.q = q;

      const res = await axios.get(`${CATEGORY_API}/all-categories`, {
        ...authHeaders,
        params,
      });
      setCategories(res.data.categories || []);
      setPagination(res.data.pagination || { total: 0, totalPages: 1 });
    } catch (error) {
      toast.error(error.response?.data?.msg || "Could not load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchCategories({ q: debouncedSearch, pageNum: page });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, debouncedSearch, page]);

  const handleDelete = async (category) => {
    const result = await Swal.fire({
      title: `Delete "${category.category_name}"?`,
      text: "This can't be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
      confirmButtonColor: "#DC2626",
    });
    if (!result.isConfirmed) return;

    try {
      await axios.delete(`${CATEGORY_API}/delete-category/${category._id}`, authHeaders);
      toast.success("Category deleted");
      fetchCategories({ q: debouncedSearch, pageNum: page });
    } catch (error) {
      toast.error(error.response?.data?.msg || "Could not delete category");
    }
  };

  const handleToggleStatus = async (category) => {
    const nextStatus = !category.status;
    setCategories((prev) =>
      prev.map((c) => (c._id === category._id ? { ...c, status: nextStatus } : c))
    );
    try {
      await axios.put(
        `${CATEGORY_API}/update-status/${category._id}`,
        { status: nextStatus },
        authHeaders
      );
    } catch (error) {
      setCategories((prev) =>
        prev.map((c) => (c._id === category._id ? { ...c, status: category.status } : c))
      );
      toast.error(error.response?.data?.msg || "Could not update status");
    }
  };

  const { totalPages, total } = pagination;
  const rangeStart = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(page * PAGE_SIZE, total);

  return (
    <div className="vc-body text-[#1F2937]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=Inter:wght@400;500;600;700&display=swap');
        .vc-display { font-family: 'Sora', system-ui, sans-serif; }
        .vc-body { font-family: 'Inter', system-ui, sans-serif; }
        .vc-card { border-radius: 16px; transition: box-shadow 0.25s ease; }
        .vc-card:hover { box-shadow: 0 20px 40px -26px rgba(31,41,55,0.2); }
        .vc-cta-primary { background-color: #F97316; transition: background-color 0.2s ease, transform 0.2s ease; }
        .vc-cta-primary:hover { background-color: #EA580C; transform: translateY(-1px); }
        .vc-icon-btn { transition: background-color 0.2s ease, color 0.2s ease; }
        .vc-input { transition: border-color 0.2s ease, box-shadow 0.2s ease; }
        .vc-input:focus { border-color: #F97316; box-shadow: 0 0 0 3px rgba(249,115,22,0.15); }
        .vc-page-btn { transition: background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease; }
        .vc-page-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        @keyframes vcSpin { to { transform: rotate(360deg); } }
        .vc-spin { animation: vcSpin 0.8s linear infinite; }
      `}</style>

      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="vc-display text-2xl font-extrabold sm:text-3xl">Categories</h1>
          <p className="vc-body mt-1 text-sm text-[#6B7280]">
            Manage the categories vendors can pick from when listing services.
          </p>
        </div>
        <button
          onClick={() => navigate("/admin/categories-form")}
          className="vc-cta-primary vc-body flex shrink-0 items-center gap-2 rounded-2xl px-5 py-2.5 text-sm font-semibold text-white"
        >
          <i className="fa-solid fa-plus text-xs"></i>
          Add category
        </button>
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
                {debouncedSearch ? "No categories match your search" : "No categories yet"}
              </p>
              <p className="vc-body mt-0.5 text-xs text-[#6B7280]">
                {debouncedSearch
                  ? "Try a different name."
                  : "Add the first category so vendors can start listing services."}
              </p>
            </div>
            {!debouncedSearch && (
              <button
                onClick={() => navigate("/admin/categories-form")}
                className="vc-cta-primary vc-body mt-1 rounded-xl px-4 py-2 text-xs font-semibold text-white"
              >
                Add category
              </button>
            )}
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

                <button
                  onClick={() => handleToggleStatus(c)}
                  className={`vc-body shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                    c.status ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-500"
                  }`}
                  title="Click to toggle"
                >
                  {c.status ? "Active" : "Inactive"}
                </button>

                <button
                  onClick={() => navigate(`/admin/categories/edit/${c._id}`)}
                  className="vc-icon-btn flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[#6B7280] hover:bg-[#F8FAFC] hover:text-[#1F2937]"
                  aria-label="Edit category"
                >
                  <i className="fa-solid fa-pen text-xs"></i>
                </button>

                <button
                  onClick={() => handleDelete(c)}
                  className="vc-icon-btn flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[#6B7280] hover:bg-red-50 hover:text-red-500"
                  aria-label="Delete category"
                >
                  <i className="fa-solid fa-trash text-xs"></i>
                </button>
              </div>
            ))}
          </div>
        )}

        {!loading && total > 0 && (
          <div className="flex flex-col items-center justify-between gap-3 border-t border-[#E5E7EB] px-5 py-3.5 sm:flex-row">
            <p className="vc-body text-xs text-[#6B7280]">
              Showing {rangeStart}–{rangeEnd} of {total}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="vc-page-btn vc-body rounded-lg border border-[#E5E7EB] px-3 py-1.5 text-xs font-semibold text-[#6B7280] hover:border-[#F97316] hover:text-[#1F2937]"
              >
                Prev
              </button>
              <span className="vc-body text-xs font-medium text-[#6B7280]">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="vc-page-btn vc-body rounded-lg border border-[#E5E7EB] px-3 py-1.5 text-xs font-semibold text-[#6B7280] hover:border-[#F97316] hover:text-[#1F2937]"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCategories;