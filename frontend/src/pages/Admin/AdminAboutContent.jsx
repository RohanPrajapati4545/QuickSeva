import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

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

const Field = ({ label, value, onChange, textarea = false }) => (
  <div className="mb-4">
    <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[#6B7280]">{label}</label>
    {textarea ? (
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        className="w-full rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm text-[#1F2937] outline-none focus:border-[#10B981]"
      />
    ) : (
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm text-[#1F2937] outline-none focus:border-[#10B981]"
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
        className="rounded-xl bg-[#10B981] px-5 py-2 text-sm font-semibold text-white disabled:opacity-60"
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

  const handleRemoveTeamMember = (index) => {
    setContent((prev) => ({
      ...prev,
      team: prev.team.filter((_, i) => i !== index),
    }));
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
        <h1 className="text-xl font-extrabold text-[#1F2937]">About Page Content</h1>
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
        title="Our Story Section"
        onSave={() => handleSaveSection("story")}
        saving={savingSection === "story"}
        status={sectionStatus.story}
      >
        <Field label="Eyebrow" value={content.storyEyebrow} onChange={(v) => handleChange("storyEyebrow", v)} />
        <Field label="Title" value={content.storyTitle} onChange={(v) => handleChange("storyTitle", v)} />
        <Field label="Story text" value={content.storyText} onChange={(v) => handleChange("storyText", v)} textarea />
      </SectionCard>

      <SectionCard
        title="Our Mission Section"
        onSave={() => handleSaveSection("mission")}
        saving={savingSection === "mission"}
        status={sectionStatus.mission}
      >
        <Field label="Eyebrow" value={content.missionEyebrow} onChange={(v) => handleChange("missionEyebrow", v)} />
        <Field label="Title" value={content.missionTitle} onChange={(v) => handleChange("missionTitle", v)} />
        <Field label="Mission text" value={content.missionText} onChange={(v) => handleChange("missionText", v)} textarea />
      </SectionCard>

      <SectionCard
        title="Our Values Section"
        onSave={() => handleSaveSection("values")}
        saving={savingSection === "values"}
        status={sectionStatus.values}
      >
        <Field label="Eyebrow" value={content.valuesEyebrow} onChange={(v) => handleChange("valuesEyebrow", v)} />
        <Field label="Title" value={content.valuesTitle} onChange={(v) => handleChange("valuesTitle", v)} />
        {content.values.map((item, i) => (
          <div key={i} className="mb-4 rounded-xl border border-[#E5E7EB] p-4">
            <p className="mb-2 text-xs font-bold text-[#10B981]">Value {i + 1}</p>
            <Field label="Icon (font-awesome name, no fa-solid prefix)" value={item.icon} onChange={(v) => handleArrayItemChange("values", i, "icon", v)} />
            <Field label="Title" value={item.title} onChange={(v) => handleArrayItemChange("values", i, "title", v)} />
            <Field label="Description" value={item.desc} onChange={(v) => handleArrayItemChange("values", i, "desc", v)} textarea />
          </div>
        ))}
      </SectionCard>

      <SectionCard
        title="Stats Section"
        onSave={() => handleSaveSection("stats")}
        saving={savingSection === "stats"}
        status={sectionStatus.stats}
      >
        {content.stats.map((stat, i) => (
          <div key={i} className="mb-4 rounded-xl border border-[#E5E7EB] p-4">
            <p className="mb-2 text-xs font-bold text-[#10B981]">Stat {i + 1}</p>
            <Field label="Number (e.g. 50,000+)" value={stat.number} onChange={(v) => handleArrayItemChange("stats", i, "number", v)} />
            <Field label="Label (e.g. Homes served)" value={stat.label} onChange={(v) => handleArrayItemChange("stats", i, "label", v)} />
          </div>
        ))}
      </SectionCard>

      <SectionCard
        title="Team Section"
        onSave={() => handleSaveSection("team")}
        saving={savingSection === "team"}
        status={sectionStatus.team}
      >
        <Field label="Eyebrow" value={content.teamEyebrow} onChange={(v) => handleChange("teamEyebrow", v)} />
        <Field label="Title" value={content.teamTitle} onChange={(v) => handleChange("teamTitle", v)} />
        {content.team.map((member, i) => (
          <div key={i} className="mb-4 rounded-xl border border-[#E5E7EB] p-4">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs font-bold text-[#10B981]">Member {i + 1}</p>
              <button
                type="button"
                onClick={() => handleRemoveTeamMember(i)}
                className="text-xs font-semibold text-red-500 hover:text-red-600"
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
          className="mb-2 w-full rounded-lg border border-dashed border-[#E5E7EB] py-2 text-sm font-semibold text-[#6B7280] hover:border-[#10B981] hover:text-[#10B981]"
        >
          + Add team member
        </button>
      </SectionCard>
    </div>
  );
};

export default AdminAboutContent;