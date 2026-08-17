import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

const API_URL = process.env.REACT_APP_API_URL;
const CONTENT_API = `${API_URL}/api/admin/contact-content`;

const EMPTY_CONTENT = {
  heroBadgeText: "",
  heroTitle: "",
  heroSubtitle: "",

  phone: "",
  email: "",
  address: "",
  mapEmbedUrl: "",
  officeHours: "",

  formHeading: "",
  formSubheading: "",
};

const SECTION_FIELDS = {
  hero: ["heroBadgeText", "heroTitle", "heroSubtitle"],
  details: ["phone", "email", "address", "mapEmbedUrl", "officeHours"],
  form: ["formHeading", "formSubheading"],
};

// Shared SweetAlert look so every alert across the admin matches the
// orange/white theme instead of the default SweetAlert styling.
const swalTheme = {
  confirmButtonColor: "#F97316",
  cancelButtonColor: "#9CA3AF",
  customClass: {
    popup: "rounded-2xl",
    confirmButton: "rounded-xl",
    cancelButton: "rounded-xl",
  },
};

const Field = ({ label, value, onChange, textarea = false }) => (
  <div className="mb-4">
    <label className="ad-body mb-1 block text-xs font-semibold uppercase tracking-wide text-[#6B7280]">{label}</label>
    {textarea ? (
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        className="ad-input ad-body w-full rounded-lg border border-[#E5E7EB] px-3.5 py-2 text-sm text-[#1F2937] outline-none"
      />
    ) : (
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="ad-input ad-body w-full rounded-lg border border-[#E5E7EB] px-3.5 py-2 text-sm text-[#1F2937] outline-none"
      />
    )}
  </div>
);

const SectionCard = ({ title, children, onSave, saving }) => (
  <div className="ad-card mb-6 border border-[#E5E7EB] bg-white p-5">
    <h2 className="ad-display mb-4 text-base font-bold text-[#1F2937]">{title}</h2>

    {children}

    <div className="flex justify-end">
      <button
        onClick={onSave}
        disabled={saving}
        className="ad-btn ad-body rounded-xl bg-[#F97316] px-5 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
      >
        {saving ? "Saving…" : "Save Section"}
      </button>
    </div>
  </div>
);

const AdminContactContent = () => {
  const [content, setContent] = useState(EMPTY_CONTENT);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const [savingSection, setSavingSection] = useState(null);

  // token is stored under the "token" key by authSlice.js (login reducer)
  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const res = await axios.get(CONTENT_API, { headers: getAuthHeaders() });
        if (res.data?.content) setContent(res.data.content);
      } catch (error) {
        console.log(error);
        Swal.fire({
          icon: "error",
          title: "Couldn't load content",
          text: error.response?.data?.msg || "Failed to load current content.",
          ...swalTheme,
        });
      } finally {
        setLoading(false);
      }
    };
    fetchContent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (field, value) => {
    setContent((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveSection = async (sectionKey, sectionLabel) => {
    const confirm = await Swal.fire({
      icon: "question",
      title: `Save ${sectionLabel}?`,
      text: "This will update the live Contact page immediately.",
      showCancelButton: true,
      confirmButtonText: "Yes, save it",
      cancelButtonText: "Cancel",
      ...swalTheme,
    });
    if (!confirm.isConfirmed) return;

    const fields = SECTION_FIELDS[sectionKey];
    const payload = fields.reduce((acc, field) => {
      acc[field] = content[field];
      return acc;
    }, {});

    setSavingSection(sectionKey);

    try {
      const res = await axios.put(CONTENT_API, payload, { headers: getAuthHeaders() });
      if (res.data?.content) setContent(res.data.content);
      Swal.fire({
        icon: "success",
        title: "Saved",
        text: `${sectionLabel} updated successfully.`,
        timer: 1800,
        showConfirmButton: false,
        ...swalTheme,
      });
    } catch (error) {
      console.log(error);
      Swal.fire({
        icon: "error",
        title: "Save failed",
        text: error.response?.data?.msg || "Failed to save this section.",
        ...swalTheme,
      });
    } finally {
      setSavingSection(null);
    }
  };

  return (
    <div className="ad-body text-[#1F2937]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=Inter:wght@400;500;600;700&display=swap');
        .ad-display { font-family: 'Sora', system-ui, sans-serif; }
        .ad-body { font-family: 'Inter', system-ui, sans-serif; }
        .ad-card { border-radius: 16px; }
        .ad-input { transition: border-color 0.2s ease, box-shadow 0.2s ease; }
        .ad-input:focus { border-color: #F97316; box-shadow: 0 0 0 3px rgba(249,115,22,0.15); }
        .ad-btn { transition: background-color 0.2s ease, opacity 0.2s ease; }
        @keyframes adSpin { to { transform: rotate(360deg); } }
        .ad-spin { animation: adSpin 0.8s linear infinite; }
      `}</style>

      <div className="mb-6">
        <button
          onClick={() => navigate("/admin/settings")}
          className="ad-body mb-6 rounded-xl border border-[#E5E7EB] px-5 py-2.5 text-sm font-semibold text-[#1F2937] hover:border-[#F97316] hover:text-[#F97316]"
        >
          ← Back to Settings
        </button>
        <h1 className="ad-display text-2xl font-extrabold sm:text-3xl">Contact Page Content</h1>
        <p className="ad-body mt-1 text-sm text-[#6B7280]">
          Each section saves independently — edit one and hit its Save button.
        </p>
      </div>

      {loading ? (
        <div className="ad-card flex items-center justify-center gap-2 border border-[#E5E7EB] bg-white py-14 text-sm text-[#6B7280]">
          <i className="fa-solid fa-circle-notch ad-spin text-[#F97316]"></i>
          Loading current content…
        </div>
      ) : (
        <>
          <SectionCard
            title="Hero Section"
            onSave={() => handleSaveSection("hero", "Hero Section")}
            saving={savingSection === "hero"}
          >
            <Field label="Badge text" value={content.heroBadgeText} onChange={(v) => handleChange("heroBadgeText", v)} />
            <Field label="Title" value={content.heroTitle} onChange={(v) => handleChange("heroTitle", v)} />
            <Field label="Subtitle" value={content.heroSubtitle} onChange={(v) => handleChange("heroSubtitle", v)} textarea />
          </SectionCard>

          <SectionCard
            title="Contact Details"
            onSave={() => handleSaveSection("details", "Contact Details")}
            saving={savingSection === "details"}
          >
            <Field label="Phone" value={content.phone} onChange={(v) => handleChange("phone", v)} />
            <Field label="Email" value={content.email} onChange={(v) => handleChange("email", v)} />
            <Field label="Address" value={content.address} onChange={(v) => handleChange("address", v)} textarea />
            <Field label="Map embed URL" value={content.mapEmbedUrl} onChange={(v) => handleChange("mapEmbedUrl", v)} />
            <Field label="Office hours" value={content.officeHours} onChange={(v) => handleChange("officeHours", v)} />
          </SectionCard>

          <SectionCard
            title="Contact Form"
            onSave={() => handleSaveSection("form", "Contact Form")}
            saving={savingSection === "form"}
          >
            <Field label="Form heading" value={content.formHeading} onChange={(v) => handleChange("formHeading", v)} />
            <Field label="Form subheading" value={content.formSubheading} onChange={(v) => handleChange("formSubheading", v)} />
          </SectionCard>
        </>
      )}
    </div>
  );
};

export default AdminContactContent;