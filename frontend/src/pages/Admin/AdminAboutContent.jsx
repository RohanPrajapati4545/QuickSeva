import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

const API_URL = process.env.REACT_APP_API_URL;
const CONTENT_API = `${API_URL}/api/admin/about-content`;

const EMPTY_CONTENT = {
  heroBadgeText: "",
  heroTitle: "",
  heroSubtitle: "",

  storyEyebrow: "",
  storyTitle: "",
  storyText: "",

  missionEyebrow: "",
  missionTitle: "",
  missionText: "",

  valuesEyebrow: "",
  valuesTitle: "",
  values: [
    { icon: "", title: "", desc: "" },
    { icon: "", title: "", desc: "" },
    { icon: "", title: "", desc: "" },
  ],

  stats: [
    { number: "", label: "" },
    { number: "", label: "" },
    { number: "", label: "" },
  ],

  teamEyebrow: "",
  teamTitle: "",
  team: [],
};

const SECTION_FIELDS = {
  hero: ["heroBadgeText", "heroTitle", "heroSubtitle"],
  story: ["storyEyebrow", "storyTitle", "storyText"],
  mission: ["missionEyebrow", "missionTitle", "missionText"],
  values: ["valuesEyebrow", "valuesTitle", "values"],
  stats: ["stats"],
  team: ["teamEyebrow", "teamTitle", "team"],
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

const AdminAboutContent = () => {
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

  const handleArrayItemChange = (arrayName, index, field, value) => {
    setContent((prev) => {
      const updated = [...prev[arrayName]];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, [arrayName]: updated };
    });
  };

  // team is variable-length, so it needs add/remove unlike the fixed-length arrays
  const handleAddTeamMember = () => {
    setContent((prev) => ({
      ...prev,
      team: [...prev.team, { name: "", role: "", photo: "" }],
    }));
  };

  const handleRemoveTeamMember = async (index) => {
    const confirm = await Swal.fire({
      icon: "warning",
      title: "Remove this member?",
      text: "This won't be saved until you hit Save Section.",
      showCancelButton: true,
      confirmButtonText: "Yes, remove",
      cancelButtonText: "Cancel",
      ...swalTheme,
    });
    if (!confirm.isConfirmed) return;

    setContent((prev) => ({
      ...prev,
      team: prev.team.filter((_, i) => i !== index),
    }));
  };

  const handleSaveSection = async (sectionKey, sectionLabel) => {
    const confirm = await Swal.fire({
      icon: "question",
      title: `Save ${sectionLabel}?`,
      text: "This will update the live About page immediately.",
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
        <h1 className="ad-display text-2xl font-extrabold sm:text-3xl">About Page Content</h1>
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
            title="Our Story Section"
            onSave={() => handleSaveSection("story", "Our Story Section")}
            saving={savingSection === "story"}
          >
            <Field label="Eyebrow" value={content.storyEyebrow} onChange={(v) => handleChange("storyEyebrow", v)} />
            <Field label="Title" value={content.storyTitle} onChange={(v) => handleChange("storyTitle", v)} />
            <Field label="Story text" value={content.storyText} onChange={(v) => handleChange("storyText", v)} textarea />
          </SectionCard>

          <SectionCard
            title="Our Mission Section"
            onSave={() => handleSaveSection("mission", "Our Mission Section")}
            saving={savingSection === "mission"}
          >
            <Field label="Eyebrow" value={content.missionEyebrow} onChange={(v) => handleChange("missionEyebrow", v)} />
            <Field label="Title" value={content.missionTitle} onChange={(v) => handleChange("missionTitle", v)} />
            <Field label="Mission text" value={content.missionText} onChange={(v) => handleChange("missionText", v)} textarea />
          </SectionCard>

          <SectionCard
            title="Our Values Section"
            onSave={() => handleSaveSection("values", "Our Values Section")}
            saving={savingSection === "values"}
          >
            <Field label="Eyebrow" value={content.valuesEyebrow} onChange={(v) => handleChange("valuesEyebrow", v)} />
            <Field label="Title" value={content.valuesTitle} onChange={(v) => handleChange("valuesTitle", v)} />
            {content.values.map((item, i) => (
              <div key={i} className="mb-4 rounded-xl border border-[#E5E7EB] p-4">
                <p className="ad-body mb-2 text-xs font-bold text-[#F97316]">Value {i + 1}</p>
                <Field label="Icon (font-awesome name, no fa-solid prefix)" value={item.icon} onChange={(v) => handleArrayItemChange("values", i, "icon", v)} />
                <Field label="Title" value={item.title} onChange={(v) => handleArrayItemChange("values", i, "title", v)} />
                <Field label="Description" value={item.desc} onChange={(v) => handleArrayItemChange("values", i, "desc", v)} textarea />
              </div>
            ))}
          </SectionCard>

          <SectionCard
            title="Stats Section"
            onSave={() => handleSaveSection("stats", "Stats Section")}
            saving={savingSection === "stats"}
          >
            {content.stats.map((stat, i) => (
              <div key={i} className="mb-4 rounded-xl border border-[#E5E7EB] p-4">
                <p className="ad-body mb-2 text-xs font-bold text-[#F97316]">Stat {i + 1}</p>
                <Field label="Number (e.g. 50,000+)" value={stat.number} onChange={(v) => handleArrayItemChange("stats", i, "number", v)} />
                <Field label="Label (e.g. Homes served)" value={stat.label} onChange={(v) => handleArrayItemChange("stats", i, "label", v)} />
              </div>
            ))}
          </SectionCard>

          <SectionCard
            title="Team Section"
            onSave={() => handleSaveSection("team", "Team Section")}
            saving={savingSection === "team"}
          >
            <Field label="Eyebrow" value={content.teamEyebrow} onChange={(v) => handleChange("teamEyebrow", v)} />
            <Field label="Title" value={content.teamTitle} onChange={(v) => handleChange("teamTitle", v)} />
            {content.team.map((member, i) => (
              <div key={i} className="mb-4 rounded-xl border border-[#E5E7EB] p-4">
                <div className="mb-2 flex items-center justify-between">
                  <p className="ad-body text-xs font-bold text-[#F97316]">Member {i + 1}</p>
                  <button
                    type="button"
                    onClick={() => handleRemoveTeamMember(i)}
                    className="ad-body text-xs font-semibold text-red-500 hover:text-red-600"
                  >
                    Remove
                  </button>
                </div>
                <Field label="Name" value={member.name} onChange={(v) => handleArrayItemChange("team", i, "name", v)} />
                <Field label="Role" value={member.role} onChange={(v) => handleArrayItemChange("team", i, "role", v)} />
                <Field label="Photo URL" value={member.photo} onChange={(v) => handleArrayItemChange("team", i, "photo", v)} />
              </div>
            ))}
            <button
              type="button"
              onClick={handleAddTeamMember}
              className="ad-body mb-2 w-full rounded-lg border border-dashed border-[#E5E7EB] py-2 text-sm font-semibold text-[#6B7280] hover:border-[#F97316] hover:text-[#F97316]"
            >
              + Add team member
            </button>
          </SectionCard>
        </>
      )}
    </div>
  );
};

export default AdminAboutContent;