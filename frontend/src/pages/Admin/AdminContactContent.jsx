import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

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

const Field = ({ label, value, onChange, textarea = false }) => (
  <div className="mb-4">
    <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[#6B7280]">{label}</label>
    {textarea ? (
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        className="w-full rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm text-[#1F2937] outline-none focus:border-[#8B5CF6]"
      />
    ) : (
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm text-[#1F2937] outline-none focus:border-[#8B5CF6]"
      />
    )}
  </div>
);

const SectionCard = ({ title, children, onSave, saving, status }) => (
  <div className="mb-6 rounded-2xl border border-[#E5E7EB] bg-white p-5">
    <h2 className="mb-4 text-base font-bold text-[#1F2937]">{title}</h2>

    {children}

    {status && (
      <div
        className={`mb-3 rounded-lg px-3 py-2 text-xs ${
          status.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
        }`}
      >
        {status.msg}
      </div>
    )}

    <div className="flex justify-end">
      <button
        onClick={onSave}
        disabled={saving}
        className="rounded-xl bg-[#8B5CF6] px-5 py-2 text-sm font-semibold text-white disabled:opacity-60"
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
  const [sectionStatus, setSectionStatus] = useState({});

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
        setSectionStatus({ page: { type: "error", msg: "Failed to load current content." } });
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

  const handleSaveSection = async (sectionKey) => {
    const fields = SECTION_FIELDS[sectionKey];
    const payload = fields.reduce((acc, field) => {
      acc[field] = content[field];
      return acc;
    }, {});

    setSavingSection(sectionKey);
    setSectionStatus((prev) => ({ ...prev, [sectionKey]: null }));

    try {
      const res = await axios.put(CONTENT_API, payload, { headers: getAuthHeaders() });
      if (res.data?.content) setContent(res.data.content);
      setSectionStatus((prev) => ({ ...prev, [sectionKey]: { type: "success", msg: "Saved." } }));
    } catch (error) {
      console.log(error);
      setSectionStatus((prev) => ({
        ...prev,
        [sectionKey]: { type: "error", msg: error.response?.data?.msg || "Failed to save this section." },
      }));
    } finally {
      setSavingSection(null);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-[#6B7280]">
        Loading current content…
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6">
        <button
          onClick={() => navigate("/admin/settings")}
          className="vd-body mt-6 rounded-xl border border-[#E5E7EB] px-5 py-2.5 text-sm font-semibold text-[#1F2937] hover:bg-[#F8FAFC]"
        >
          ← Back to Settings
        </button>
        <h1 className="text-xl font-extrabold text-[#1F2937]">Contact Page Content</h1>
        <p className="mt-1 text-sm text-[#6B7280]">Each section saves independently — edit one and hit its Save button.</p>
      </div>

      {sectionStatus.page && (
        <div className="mb-6 rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-700">{sectionStatus.page.msg}</div>
      )}

      <SectionCard
        title="Hero Section"
        onSave={() => handleSaveSection("hero")}
        saving={savingSection === "hero"}
        status={sectionStatus.hero}
      >
        <Field label="Badge text" value={content.heroBadgeText} onChange={(v) => handleChange("heroBadgeText", v)} />
        <Field label="Title" value={content.heroTitle} onChange={(v) => handleChange("heroTitle", v)} />
        <Field label="Subtitle" value={content.heroSubtitle} onChange={(v) => handleChange("heroSubtitle", v)} textarea />
      </SectionCard>

      <SectionCard
        title="Contact Details"
        onSave={() => handleSaveSection("details")}
        saving={savingSection === "details"}
        status={sectionStatus.details}
      >
        <Field label="Phone" value={content.phone} onChange={(v) => handleChange("phone", v)} />
        <Field label="Email" value={content.email} onChange={(v) => handleChange("email", v)} />
        <Field label="Address" value={content.address} onChange={(v) => handleChange("address", v)} textarea />
        <Field label="Map embed URL" value={content.mapEmbedUrl} onChange={(v) => handleChange("mapEmbedUrl", v)} />
        <Field label="Office hours" value={content.officeHours} onChange={(v) => handleChange("officeHours", v)} />
      </SectionCard>

      <SectionCard
        title="Contact Form"
        onSave={() => handleSaveSection("form")}
        saving={savingSection === "form"}
        status={sectionStatus.form}
      >
        <Field label="Form heading" value={content.formHeading} onChange={(v) => handleChange("formHeading", v)} />
        <Field label="Form subheading" value={content.formSubheading} onChange={(v) => handleChange("formSubheading", v)} />
      </SectionCard>
    </div>
  );
};

export default AdminContactContent;