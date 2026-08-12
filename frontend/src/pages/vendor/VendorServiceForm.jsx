import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";

const CATEGORY_API = `${process.env.REACT_APP_API_URL}/api/vendor`;
const SERVICE_API = `${process.env.REACT_APP_API_URL}/api/vendor-service`;
const BASE_URL = process.env.REACT_APP_API_URL;

const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (/^https?:\/\//i.test(imagePath)) return imagePath;
  const cleanBase = BASE_URL?.replace(/\/$/, "") || "";
  const cleanPath = imagePath.replace(/^\//, "");
  return `${cleanBase}/${cleanPath}`;
};

const VendorServiceForm = () => {
  const { id } = useParams(); // present only in edit mode
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { token } = useSelector((state) => state.auth || {});

  const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

  const [categories, setCategories] = useState([]);
  const [categoryFields, setCategoryFields] = useState([]);

  const [form, setForm] = useState({
    category: "",
    service_name: "",
    description: "",
    price: "",
  });
  const [customValues, setCustomValues] = useState({});
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [existingImage, setExistingImage] = useState("");

  const [loading, setLoading] = useState(isEdit);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      setCategoriesLoading(true);
      try {
        const res = await axios.get(`${CATEGORY_API}/all-categories`, authHeaders);
        setCategories(res.data.categories || []);
      } catch (error) {
        toast.error(error.response?.data?.msg || "Could not load categories");
      } finally {
        setCategoriesLoading(false);
      }
    };
    if (token) fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => {
    if (!isEdit) return;
    const fetchService = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${SERVICE_API}/service/${id}`, authHeaders);
        const s = res.data.service;
        setForm({
          category: s.category?._id || "",
          service_name: s.service_name || "",
          description: s.description || "",
          price: s.price ?? "",
        });
        setCategoryFields(s.category?.fields || []);
        setCustomValues(s.custom_fields || {});
        setExistingImage(s.image || "");
      } catch (error) {
        toast.error(error.response?.data?.msg || "Could not load service");
        navigate("/vendor/services");
      } finally {
        setLoading(false);
      }
    };
    fetchService();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (!imageFile) {
      setImagePreview("");
      return;
    }
    const url = URL.createObjectURL(imageFile);
    setImagePreview(url);
    return () => URL.revokeObjectURL(url);
  }, [imageFile]);

  const handleCategoryChange = (categoryId) => {
    setForm((prev) => ({ ...prev, category: categoryId }));
    const selected = categories.find((c) => c._id === categoryId);
    setCategoryFields(selected?.fields || []);
    setCustomValues({});
  };

  const handleCustomValueChange = (field_name, value) => {
    setCustomValues((prev) => ({ ...prev, [field_name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.category) return toast.error("Please select a category");
    if (!form.service_name.trim()) return toast.error("Service name is required");
    if (form.price === "" || Number(form.price) < 0) return toast.error("Enter a valid price");

    for (const f of categoryFields) {
      if (f.required && !customValues[f.field_name]) {
        return toast.error(`"${f.label}" is required`);
      }
    }

    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("category", form.category);
      fd.append("service_name", form.service_name);
      fd.append("description", form.description);
      fd.append("price", form.price);
      fd.append("custom_fields", JSON.stringify(customValues));
      if (imageFile) fd.append("image", imageFile);

      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      };

      if (isEdit) {
        await axios.put(`${SERVICE_API}/update-service/${id}`, fd, { headers });
        toast.success("Service updated");
      } else {
        await axios.post(`${SERVICE_API}/add-service`, fd, { headers });
        toast.success("Service added");
      }
      navigate("/vendor/services");
    } catch (error) {
      toast.error(error.response?.data?.msg || "Could not save service");
    } finally {
      setSaving(false);
    }
  };

  // Ek category field ko uske field_type ke hisaab se render karta hai
  const renderCustomField = (field) => {
    const value = customValues[field.field_name] ?? (field.field_type === "checkbox" ? false : "");

    if (field.field_type === "select") {
      return (
        <select
          value={value}
          onChange={(e) => handleCustomValueChange(field.field_name, e.target.value)}
          className="vsf-input vsf-body w-full rounded-lg border border-[#E5E7EB] px-3.5 py-2.5 text-sm"
        >
          <option value="">Select {field.label}</option>
          {(field.options || []).map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      );
    }

    if (field.field_type === "textarea") {
      return (
        <textarea
          value={value}
          onChange={(e) => handleCustomValueChange(field.field_name, e.target.value)}
          rows={3}
          className="vsf-input vsf-body w-full rounded-lg border border-[#E5E7EB] px-3.5 py-2.5 text-sm"
        />
      );
    }

    if (field.field_type === "checkbox") {
      return (
        <label className="vsf-body flex items-center gap-2 text-sm text-[#1F2937]">
          <input
            type="checkbox"
            checked={Boolean(value)}
            onChange={(e) => handleCustomValueChange(field.field_name, e.target.checked)}
          />
          {field.label}
        </label>
      );
    }

    // text / number
    return (
      <input
        type={field.field_type === "number" ? "number" : "text"}
        value={value}
        onChange={(e) => handleCustomValueChange(field.field_name, e.target.value)}
        className="vsf-input vsf-body w-full rounded-lg border border-[#E5E7EB] px-3.5 py-2.5 text-sm"
      />
    );
  };

  if (loading || categoriesLoading) {
    return (
      <div className="flex items-center justify-center gap-2 py-24 text-sm text-[#6B7280]">
        <i className="fa-solid fa-circle-notch animate-spin text-[#F97316]"></i>
        Loading…
      </div>
    );
  }

  const selectedCategory = categories.find((c) => c._id === form.category);
  const previewImage = imagePreview || getImageUrl(existingImage);
  const filledCount = categoryFields.filter((f) => customValues[f.field_name]).length;

  return (
    <div className="vsf-body min-h-screen w-full bg-[#F8FAFC] text-[#1F2937]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=Inter:wght@400;500;600;700&display=swap');
        .vsf-display { font-family: 'Sora', system-ui, sans-serif; }
        .vsf-body { font-family: 'Inter', system-ui, sans-serif; }
        .vsf-eyebrow { letter-spacing: 0.18em; }
        .vsf-panel { border-radius: 22px; box-shadow: 0 24px 60px -40px rgba(31,41,55,0.25); }
        .vsf-input { transition: border-color 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease; background-color: #FAFAFA; }
        .vsf-input:focus { border-color: #F97316; box-shadow: 0 0 0 4px rgba(249,115,22,0.12); outline: none; background-color: #FFFFFF; }
        .vsf-cta-primary { background-color: #F97316; transition: background-color 0.2s ease, transform 0.15s ease; box-shadow: 0 14px 30px -14px rgba(249,115,22,0.65); }
        .vsf-cta-primary:hover:not(:disabled) { background-color: #EA580C; transform: translateY(-1px); }
        .vsf-cta-primary:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
        .vsf-icon-chip { background: linear-gradient(135deg, #FFF3E8, #FFE4CC); }
        .vsf-sidebar { position: sticky; top: 24px; }
        .vsf-dropzone { border-radius: 18px; transition: border-color 0.2s ease, background-color 0.2s ease; }
        .vsf-dropzone:hover { border-color: #F97316; background-color: #FFF7ED; }
      `}</style>

      <div className="mx-auto w-full max-w-[1400px] px-5 py-8 sm:px-8 lg:py-12">
        <button
          onClick={() => navigate("/vendor/services")}
          className="vsf-body flex items-center gap-1.5 text-sm font-medium text-[#6B7280] hover:text-[#1F2937]"
        >
          <i className="fa-solid fa-arrow-left text-xs"></i>
          Back to services
        </button>

        <div className="mt-4 flex flex-wrap items-end justify-between gap-4 border-b border-[#E5E7EB] pb-6">
          <div>
            <span className="vsf-eyebrow vsf-body text-[11px] font-bold uppercase text-[#F97316]">
              Vendor · Service
            </span>
            <h1 className="vsf-display mt-1 text-3xl font-extrabold tracking-tight sm:text-4xl">
              {isEdit ? "Edit service" : "Add service"}
            </h1>
            <p className="vsf-body mt-2 max-w-xl text-sm text-[#6B7280]">
              Select a category first — its custom fields will appear below so customers get exactly the details they need.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
          {/* LEFT: form sections */}
          <div className="space-y-6">
            <section className="vsf-panel border border-[#E5E7EB] bg-white p-6 sm:p-8">
              <div className="flex items-center gap-3">
                <span className="vsf-icon-chip flex h-10 w-10 items-center justify-center rounded-2xl text-[#F97316]">
                  <i className="fa-solid fa-briefcase text-base"></i>
                </span>
                <div>
                  <h2 className="vsf-display text-lg font-extrabold">Service details</h2>
                  <p className="vsf-body text-xs text-[#6B7280]">What customers see on the listing</p>
                </div>
              </div>

              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="vsf-body mb-1.5 block text-xs font-semibold text-[#6B7280]">
                    Category
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    className="vsf-input vsf-body w-full rounded-xl border border-[#E5E7EB] px-4 py-3 text-sm"
                    required
                  >
                    <option value="">Select category</option>
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>{c.category_name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="vsf-body mb-1.5 block text-xs font-semibold text-[#6B7280]">
                    Price (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    placeholder="e.g. 499"
                    className="vsf-input vsf-body w-full rounded-xl border border-[#E5E7EB] px-4 py-3 text-sm"
                    required
                  />
                </div>
              </div>

              <div className="mt-5">
                <label className="vsf-body mb-1.5 block text-xs font-semibold text-[#6B7280]">
                  Service name
                </label>
                <input
                  type="text"
                  value={form.service_name}
                  onChange={(e) => setForm({ ...form, service_name: e.target.value })}
                  placeholder="e.g. Wiring Installation"
                  className="vsf-input vsf-body w-full rounded-xl border border-[#E5E7EB] px-4 py-3 text-sm"
                  required
                />
              </div>

              <div className="mt-5">
                <label className="vsf-body mb-1.5 block text-xs font-semibold text-[#6B7280]">
                  Description
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  placeholder="Briefly describe this service"
                  className="vsf-input vsf-body w-full rounded-xl border border-[#E5E7EB] px-4 py-3 text-sm"
                />
              </div>

              <div className="mt-5">
                <label className="vsf-body mb-1.5 block text-xs font-semibold text-[#6B7280]">
                  Image
                </label>
                <label className="vsf-dropzone vsf-body flex cursor-pointer items-center gap-4 border border-dashed border-[#E5E7EB] p-4">
                  {previewImage ? (
                    <img src={previewImage} alt="" className="h-16 w-16 shrink-0 rounded-xl object-cover" />
                  ) : (
                    <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-[#F8FAFC] text-[#F97316]">
                      <i className="fa-solid fa-image text-xl"></i>
                    </span>
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#1F2937]">
                      {imageFile ? imageFile.name : "Click to upload a photo"}
                    </p>
                    <p className="mt-0.5 text-xs text-[#9CA3AF]">PNG or JPG, ideally a clean shot of the work</p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                    className="hidden"
                  />
                </label>
              </div>
            </section>

            {/* Dynamic category fields */}
            {form.category && (
              <section className="vsf-panel border border-[#E5E7EB] bg-white p-6 sm:p-8">
                <div className="flex items-center gap-3">
                  <span className="vsf-icon-chip flex h-10 w-10 items-center justify-center rounded-2xl text-[#F97316]">
                    <i className={`fa-solid ${selectedCategory?.icon || "fa-sliders"} text-base`}></i>
                  </span>
                  <div>
                    <h2 className="vsf-display text-lg font-extrabold">Category details</h2>
                    <p className="vsf-body text-xs text-[#6B7280]">
                      {categoryFields.length === 0
                        ? "No extra fields for this category"
                        : `${filledCount}/${categoryFields.length} filled`}
                    </p>
                  </div>
                </div>

                {categoryFields.length === 0 ? (
                  <div className="vsf-body mt-5 rounded-2xl border border-dashed border-[#E5E7EB] bg-[#F8FAFC] p-6 text-center text-xs text-[#6B7280]">
                    This category has no custom fields.
                  </div>
                ) : (
                  <div className="mt-5 grid gap-5 sm:grid-cols-2">
                    {categoryFields.map((field) => (
                      <div key={field.field_name} className={field.field_type === "textarea" ? "sm:col-span-2" : ""}>
                        {field.field_type !== "checkbox" && (
                          <label className="vsf-body mb-1.5 block text-[11px] font-semibold text-[#6B7280]">
                            {field.label}{field.required ? " *" : ""}
                          </label>
                        )}
                        {renderCustomField(field)}
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}

            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={saving}
                className="vsf-cta-primary vsf-body rounded-2xl px-7 py-3 text-sm font-semibold text-white"
              >
                {saving ? "Saving…" : isEdit ? "Save changes" : "Add service"}
              </button>
              <button
                type="button"
                onClick={() => navigate("/vendor/services")}
                className="vsf-body rounded-2xl border border-[#E5E7EB] px-7 py-3 text-sm font-semibold text-[#1F2937] hover:bg-white"
              >
                Cancel
              </button>
            </div>
          </div>

          {/* RIGHT: live preview + tips */}
          <div className="vsf-sidebar space-y-5">
            <div className="vsf-panel border border-[#E5E7EB] bg-white p-6">
              <span className="vsf-eyebrow vsf-body text-[10px] font-bold uppercase text-[#9CA3AF]">
                Live preview
              </span>
              <div className="mt-3 overflow-hidden rounded-2xl border border-[#E5E7EB]">
                {previewImage ? (
                  <img src={previewImage} alt="" className="h-36 w-full object-cover" />
                ) : (
                  <div className="flex h-36 w-full items-center justify-center bg-[#F8FAFC] text-[#F97316]">
                    <i className={`fa-solid ${selectedCategory?.icon || "fa-tags"} text-3xl`}></i>
                  </div>
                )}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <p className="vsf-display truncate text-sm font-bold">
                      {form.service_name || "Service name"}
                    </p>
                    <span className="vsf-display shrink-0 text-sm font-extrabold text-[#F97316]">
                      {form.price !== "" ? `₹${form.price}` : "₹—"}
                    </span>
                  </div>
                  <p className="vsf-body mt-0.5 text-xs text-[#6B7280]">
                    {selectedCategory?.category_name || "Category"}
                  </p>
                  {form.description && (
                    <p className="vsf-body mt-2 line-clamp-2 text-xs text-[#6B7280]">{form.description}</p>
                  )}
                </div>
              </div>
              <p className="vsf-body mt-3 text-[11px] leading-relaxed text-[#9CA3AF]">
                This mirrors the card customers see on the services grid.
              </p>
            </div>

            <div className="vsf-panel border border-[#E5E7EB] bg-[#1F2937] p-6 text-white">
              <span className="vsf-eyebrow vsf-body text-[10px] font-bold uppercase text-white/50">
                Tips
              </span>
              <ul className="vsf-body mt-3 space-y-3 text-xs leading-relaxed text-white/80">
                <li className="flex gap-2">
                  <i className="fa-solid fa-circle-check mt-0.5 text-[#F97316]"></i>
                  A clear photo increases booking requests — avoid stock or blurry shots.
                </li>
                <li className="flex gap-2">
                  <i className="fa-solid fa-circle-check mt-0.5 text-[#F97316]"></i>
                  Price it fairly for the category — customers compare across vendors.
                </li>
                <li className="flex gap-2">
                  <i className="fa-solid fa-circle-check mt-0.5 text-[#F97316]"></i>
                  Fill every category field — it's what customers filter and search by.
                </li>
              </ul>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VendorServiceForm;