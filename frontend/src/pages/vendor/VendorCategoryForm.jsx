import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";

const CATEGORY_API = `${process.env.REACT_APP_API_URL}/api/vendor`;
const FIELD_TYPES = ["text", "number", "select", "textarea", "checkbox"];

const emptyField = () => ({
  label: "",
  field_name: "",
  field_type: "text",
  options: [],
  required: false,
});

// slugify a label into a machine-safe field_name, e.g. "Wire Type" -> "wire_type"
const slugify = (str) =>
  str.trim().toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");

const VendorCategoryForm = () => {
  const { id } = useParams(); // present only in edit mode
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { token } = useSelector((state) => state.auth || {});

  const [form, setForm] = useState({
    category_name: "",
    icon: "fa-tags",
    description: "",
  });
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    if (!isEdit) return;
    const fetchCategory = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${CATEGORY_API}/category/${id}`, authHeaders);
        const c = res.data.category;
        setForm({
          category_name: c.category_name || "",
          icon: c.icon || "fa-tags",
          description: c.description || "",
        });
        setFields(c.fields || []);
      } catch (error) {
        toast.error(error.response?.data?.msg || "Could not load category");
        navigate("/vendor/categories");
      } finally {
        setLoading(false);
      }
    };
    fetchCategory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleFieldChange = (index, key, value) => {
    setFields((prev) => {
      const next = [...prev];
      const field = { ...next[index], [key]: value };
      if (key === "label") field.field_name = slugify(value);
      next[index] = field;
      return next;
    });
  };

  const handleOptionsChange = (index, rawValue) => {
    const options = rawValue.split(",").map((o) => o.trim()).filter(Boolean);
    handleFieldChange(index, "options", options);
  };

  const addField = () => setFields((prev) => [...prev, emptyField()]);
  const removeField = (index) => setFields((prev) => prev.filter((_, i) => i !== index));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.category_name.trim()) {
      toast.error("Category name is required");
      return;
    }
    for (const f of fields) {
      if (!f.label.trim()) {
        toast.error("Every custom field needs a label");
        return;
      }
      if (f.field_type === "select" && f.options.length === 0) {
        toast.error(`"${f.label}" is a select field but has no options`);
        return;
      }
    }

    setSaving(true);
    try {
      const payload = { ...form, fields };
      if (isEdit) {
        await axios.put(`${CATEGORY_API}/update-category/${id}`, payload, authHeaders);
        toast.success("Category updated");
      } else {
        await axios.post(`${CATEGORY_API}/add-category`, payload, authHeaders);
        toast.success("Category added");
      }
      navigate("/vendor/categories");
    } catch (error) {
      toast.error(error.response?.data?.msg || "Could not save category");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-24 text-sm text-[#6B7280]">
        <i className="fa-solid fa-circle-notch animate-spin text-[#F97316]"></i>
        Loading…
      </div>
    );
  }

  const requiredCount = fields.filter((f) => f.required).length;

  return (
    <div className="vf-body min-h-screen w-full bg-[#F8FAFC] text-[#1F2937]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=Inter:wght@400;500;600;700&display=swap');
        .vf-display { font-family: 'Sora', system-ui, sans-serif; }
        .vf-body { font-family: 'Inter', system-ui, sans-serif; }
        .vf-eyebrow { letter-spacing: 0.18em; }
        .vf-panel { border-radius: 22px; box-shadow: 0 24px 60px -40px rgba(31,41,55,0.25); }
        .vf-input { transition: border-color 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease; background-color: #FAFAFA; }
        .vf-input:focus { border-color: #F97316; box-shadow: 0 0 0 4px rgba(249,115,22,0.12); outline: none; background-color: #FFFFFF; }
        .vf-cta-primary { background-color: #F97316; transition: background-color 0.2s ease, transform 0.15s ease; box-shadow: 0 14px 30px -14px rgba(249,115,22,0.65); }
        .vf-cta-primary:hover:not(:disabled) { background-color: #EA580C; transform: translateY(-1px); }
        .vf-cta-primary:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
        .vf-field-card { border-radius: 18px; transition: border-color 0.2s ease, box-shadow 0.2s ease; }
        .vf-field-card:hover { border-color: #FBBF77; box-shadow: 0 16px 34px -28px rgba(31,41,55,0.3); }
        .vf-sidebar { position: sticky; top: 24px; }
        .vf-icon-chip { background: linear-gradient(135deg, #FFF3E8, #FFE4CC); }
      `}</style>

      <div className="mx-auto w-full max-w-[1400px] px-5 py-8 sm:px-8 lg:py-12">
        <button
          onClick={() => navigate("/vendor/categories")}
          className="vf-body flex items-center gap-1.5 text-sm font-medium text-[#6B7280] hover:text-[#1F2937]"
        >
          <i className="fa-solid fa-arrow-left text-xs"></i>
          Back to categories
        </button>

        <div className="mt-4 flex flex-wrap items-end justify-between gap-4 border-b border-[#E5E7EB] pb-6">
          <div>
            <span className="vf-eyebrow vf-body text-[11px] font-bold uppercase text-[#F97316]">
              Vendor · Category
            </span>
            <h1 className="vf-display mt-1 text-3xl font-extrabold tracking-tight sm:text-4xl">
              {isEdit ? "Edit category" : "Add category"}
            </h1>
            <p className="vf-body mt-2 max-w-xl text-sm text-[#6B7280]">
              Custom fields show up on the "Add service" form for this category, so vendors capture the right details every time.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
          {/* LEFT: form sections */}
          <div className="space-y-6">
            <section className="vf-panel border border-[#E5E7EB] bg-white p-6 sm:p-8">
              <div className="flex items-center gap-3">
                <span className="vf-icon-chip flex h-10 w-10 items-center justify-center rounded-2xl text-[#F97316]">
                  <i className={`fa-solid ${form.icon || "fa-tags"} text-base`}></i>
                </span>
                <div>
                  <h2 className="vf-display text-lg font-extrabold">Category details</h2>
                  <p className="vf-body text-xs text-[#6B7280]">The basics customers see first</p>
                </div>
              </div>

              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="vf-body mb-1.5 block text-xs font-semibold text-[#6B7280]">
                    Category name
                  </label>
                  <input
                    type="text"
                    value={form.category_name}
                    onChange={(e) => setForm({ ...form, category_name: e.target.value })}
                    placeholder="e.g. Electrical"
                    className="vf-input vf-body w-full rounded-xl border border-[#E5E7EB] px-4 py-3 text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="vf-body mb-1.5 block text-xs font-semibold text-[#6B7280]">
                    Icon (Font Awesome class)
                  </label>
                  <input
                    type="text"
                    value={form.icon}
                    onChange={(e) => setForm({ ...form, icon: e.target.value })}
                    placeholder="fa-bolt"
                    className="vf-input vf-body w-full rounded-xl border border-[#E5E7EB] px-4 py-3 text-sm"
                  />
                </div>
              </div>
              <div className="mt-5">
                <label className="vf-body mb-1.5 block text-xs font-semibold text-[#6B7280]">
                  Description
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  placeholder="What kind of services fall under this category?"
                  className="vf-input vf-body w-full rounded-xl border border-[#E5E7EB] px-4 py-3 text-sm"
                />
              </div>
            </section>

            <section className="vf-panel border border-[#E5E7EB] bg-white p-6 sm:p-8">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="vf-icon-chip flex h-10 w-10 items-center justify-center rounded-2xl text-[#F97316]">
                    <i className="fa-solid fa-sliders text-base"></i>
                  </span>
                  <div>
                    <h2 className="vf-display text-lg font-extrabold">Custom fields</h2>
                    <p className="vf-body text-xs text-[#6B7280]">
                      {fields.length} field{fields.length === 1 ? "" : "s"} · {requiredCount} required
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={addField}
                  className="vf-body flex shrink-0 items-center gap-1.5 rounded-xl border border-[#E5E7EB] px-4 py-2 text-xs font-semibold text-[#1F2937] hover:border-[#F97316] hover:text-[#F97316]"
                >
                  <i className="fa-solid fa-plus text-[10px]"></i>
                  Add field
                </button>
              </div>

              {fields.length === 0 ? (
                <div className="vf-body mt-5 rounded-2xl border border-dashed border-[#E5E7EB] bg-[#F8FAFC] p-6 text-center text-xs text-[#6B7280]">
                  No custom fields yet. Add one if this category needs extra details — like wire type or room size.
                </div>
              ) : (
                <div className="mt-5 space-y-4">
                  {fields.map((field, index) => (
                    <div key={index} className="vf-field-card border border-[#E5E7EB] p-5">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <label className="vf-body mb-1 block text-[11px] font-semibold text-[#6B7280]">
                            Label
                          </label>
                          <input
                            type="text"
                            value={field.label}
                            onChange={(e) => handleFieldChange(index, "label", e.target.value)}
                            placeholder="Wire Type"
                            className="vf-input vf-body w-full rounded-lg border border-[#E5E7EB] px-3.5 py-2.5 text-sm"
                            required
                          />
                        </div>
                        <div>
                          <label className="vf-body mb-1 block text-[11px] font-semibold text-[#6B7280]">
                            Field type
                          </label>
                          <select
                            value={field.field_type}
                            onChange={(e) => handleFieldChange(index, "field_type", e.target.value)}
                            className="vf-input vf-body w-full rounded-lg border border-[#E5E7EB] px-3.5 py-2.5 text-sm"
                          >
                            {FIELD_TYPES.map((t) => (
                              <option key={t} value={t}>{t}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {field.field_type === "select" && (
                        <div className="mt-4">
                          <label className="vf-body mb-1 block text-[11px] font-semibold text-[#6B7280]">
                            Options (comma separated)
                          </label>
                          <input
                            type="text"
                            value={field.options.join(", ")}
                            onChange={(e) => handleOptionsChange(index, e.target.value)}
                            placeholder="Copper, Aluminium"
                            className="vf-input vf-body w-full rounded-lg border border-[#E5E7EB] px-3.5 py-2.5 text-sm"
                          />
                        </div>
                      )}

                      <div className="mt-4 flex items-center justify-between border-t border-[#F1F5F9] pt-4">
                        <label className="vf-body flex items-center gap-2 text-xs text-[#6B7280]">
                          <input
                            type="checkbox"
                            checked={field.required}
                            onChange={(e) => handleFieldChange(index, "required", e.target.checked)}
                          />
                          Required on the service form
                        </label>
                        <button
                          type="button"
                          onClick={() => removeField(index)}
                          className="vf-body flex items-center gap-1.5 text-xs font-semibold text-red-500 hover:text-red-600"
                        >
                          <i className="fa-solid fa-trash text-[10px]"></i>
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={saving}
                className="vf-cta-primary vf-body rounded-2xl px-7 py-3 text-sm font-semibold text-white"
              >
                {saving ? "Saving…" : isEdit ? "Save changes" : "Add category"}
              </button>
              <button
                type="button"
                onClick={() => navigate("/vendor/categories")}
                className="vf-body rounded-2xl border border-[#E5E7EB] px-7 py-3 text-sm font-semibold text-[#1F2937] hover:bg-white"
              >
                Cancel
              </button>
            </div>
          </div>

          {/* RIGHT: live preview + tips */}
          <div className="vf-sidebar space-y-5">
            <div className="vf-panel border border-[#E5E7EB] bg-white p-6">
              <span className="vf-eyebrow vf-body text-[10px] font-bold uppercase text-[#9CA3AF]">
                Live preview
              </span>
              <div className="mt-3 flex items-center gap-3 rounded-2xl border border-[#E5E7EB] bg-[#F8FAFC] p-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#F97316]/15 text-[#F97316]">
                  <i className={`fa-solid ${form.icon || "fa-tags"}`}></i>
                </span>
                <div className="min-w-0">
                  <p className="vf-display truncate text-sm font-bold">
                    {form.category_name || "Category name"}
                  </p>
                  <p className="vf-body mt-0.5 truncate text-xs text-[#6B7280]">
                    {form.description || "Description will appear here"}
                  </p>
                </div>
              </div>
              <p className="vf-body mt-3 text-[11px] leading-relaxed text-[#9CA3AF]">
                This is how the category chip appears in the customer-facing services filter.
              </p>
            </div>

            <div className="vf-panel border border-[#E5E7EB] bg-[#1F2937] p-6 text-white">
              <span className="vf-eyebrow vf-body text-[10px] font-bold uppercase text-white/50">
                Tips
              </span>
              <ul className="vf-body mt-3 space-y-3 text-xs leading-relaxed text-white/80">
                <li className="flex gap-2">
                  <i className="fa-solid fa-circle-check mt-0.5 text-[#F97316]"></i>
                  Keep field labels short — they double as form labels for vendors.
                </li>
                <li className="flex gap-2">
                  <i className="fa-solid fa-circle-check mt-0.5 text-[#F97316]"></i>
                  Mark a field required only if a service truly can't be listed without it.
                </li>
                <li className="flex gap-2">
                  <i className="fa-solid fa-circle-check mt-0.5 text-[#F97316]"></i>
                  Use "select" fields for fixed choices — it keeps data clean for filtering later.
                </li>
              </ul>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VendorCategoryForm;