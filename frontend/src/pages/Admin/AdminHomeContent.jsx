import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_URL = process.env.REACT_APP_API_URL;
const CONTENT_API = `${API_URL}/api/admin/home-content`;

const EMPTY_CONTENT = {
  heroBadgeText: "",
  heroTitleLine1: "",
  heroTitleLine2: "",
  heroSubtitle: "",
  heroSearchPlaceholder: "",
  heroSearchButtonText: "",
  heroCtaPrimaryText: "",
  heroCtaGhostText: "",

  servicesEyebrow: "",
  servicesTitle: "",
  servicesSubtitle: "",

  whyUsEyebrow: "",
  whyUsTitle: "",
  whyUs: [
    { icon: "", title: "", desc: "" },
    { icon: "", title: "", desc: "" },
    { icon: "", title: "", desc: "" },
    { icon: "", title: "", desc: "" },
  ],

  howItWorksEyebrow: "",
  howItWorksTitle: "",
  howItWorks: [
    { n: "01", icon: "", title: "", desc: "" },
    { n: "02", icon: "", title: "", desc: "" },
    { n: "03", icon: "", title: "", desc: "" },
  ],

  vendorsEyebrow: "",
  vendorsTitle: "",

  reviewsEyebrow: "",
  reviewsTitle: "",
  reviews: [
    { name: "", role: "", quote: "" },
    { name: "", role: "", quote: "" },
    { name: "", role: "", quote: "" },
  ],

  appEyebrow: "",
  appTitle: "",
  appSubtitle: "",
  appStoreText: "",
  googlePlayText: "",
};

const SECTION_FIELDS = {
  hero: [
    "heroBadgeText",
    "heroTitleLine1",
    "heroTitleLine2",
    "heroSubtitle",
    "heroSearchPlaceholder",
    "heroSearchButtonText",
    "heroCtaPrimaryText",
    "heroCtaGhostText",
  ],
  services: ["servicesEyebrow", "servicesTitle", "servicesSubtitle"],
  whyUs: ["whyUsEyebrow", "whyUsTitle", "whyUs"],
  howItWorks: ["howItWorksEyebrow", "howItWorksTitle", "howItWorks"],
  vendors: ["vendorsEyebrow", "vendorsTitle"],
  reviews: ["reviewsEyebrow", "reviewsTitle", "reviews"],
  app: ["appEyebrow", "appTitle", "appSubtitle", "appStoreText", "googlePlayText"],
};

const Field = ({ label, value, onChange, textarea = false }) => (
  <div className="mb-4">
    <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[#6B7280]">{label}</label>
    {textarea ? (
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        className="w-full rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm text-[#1F2937] outline-none focus:border-[#F97316]"
      />
    ) : (
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm text-[#1F2937] outline-none focus:border-[#F97316]"
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
        className="rounded-xl bg-[#F97316] px-5 py-2 text-sm font-semibold text-white disabled:opacity-60"
      >
        {saving ? "Saving…" : "Save Section"}
      </button>
    </div>
  </div>
);

const AdminHomeContent = () => {
  const [content, setContent] = useState(EMPTY_CONTENT);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const [savingSection, setSavingSection] = useState(null);
  const [sectionStatus, setSectionStatus] = useState({});

  // token is stored under the "token" key by authSlice.js (login reducer),
  // not "adminToken" — must match exactly or authMiddleware returns 401
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
        <h1 className="text-xl font-extrabold text-[#1F2937]">Home Page Content</h1>
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
        <Field label="Title — line 1" value={content.heroTitleLine1} onChange={(v) => handleChange("heroTitleLine1", v)} />
        <Field label="Title — line 2 (highlighted)" value={content.heroTitleLine2} onChange={(v) => handleChange("heroTitleLine2", v)} />
        <Field label="Subtitle" value={content.heroSubtitle} onChange={(v) => handleChange("heroSubtitle", v)} textarea />
        <Field label="Search placeholder" value={content.heroSearchPlaceholder} onChange={(v) => handleChange("heroSearchPlaceholder", v)} />
        <Field label="Search button text" value={content.heroSearchButtonText} onChange={(v) => handleChange("heroSearchButtonText", v)} />
        <Field label="Primary CTA text" value={content.heroCtaPrimaryText} onChange={(v) => handleChange("heroCtaPrimaryText", v)} />
        <Field label="Ghost CTA text" value={content.heroCtaGhostText} onChange={(v) => handleChange("heroCtaGhostText", v)} />
      </SectionCard>

      <SectionCard
        title="Popular Services Section (header only — categories are live data)"
        onSave={() => handleSaveSection("services")}
        saving={savingSection === "services"}
        status={sectionStatus.services}
      >
        <Field label="Eyebrow" value={content.servicesEyebrow} onChange={(v) => handleChange("servicesEyebrow", v)} />
        <Field label="Title" value={content.servicesTitle} onChange={(v) => handleChange("servicesTitle", v)} />
        <Field label="Subtitle" value={content.servicesSubtitle} onChange={(v) => handleChange("servicesSubtitle", v)} />
      </SectionCard>

      <SectionCard
        title="Why QuickSeva Section"
        onSave={() => handleSaveSection("whyUs")}
        saving={savingSection === "whyUs"}
        status={sectionStatus.whyUs}
      >
        <Field label="Eyebrow" value={content.whyUsEyebrow} onChange={(v) => handleChange("whyUsEyebrow", v)} />
        <Field label="Title" value={content.whyUsTitle} onChange={(v) => handleChange("whyUsTitle", v)} />
        {content.whyUs.map((item, i) => (
          <div key={i} className="mb-4 rounded-xl border border-[#E5E7EB] p-4">
            <p className="mb-2 text-xs font-bold text-[#F97316]">Box {i + 1}</p>
            <Field label="Icon (font-awesome name, no fa-solid prefix)" value={item.icon} onChange={(v) => handleArrayItemChange("whyUs", i, "icon", v)} />
            <Field label="Title" value={item.title} onChange={(v) => handleArrayItemChange("whyUs", i, "title", v)} />
            <Field label="Description" value={item.desc} onChange={(v) => handleArrayItemChange("whyUs", i, "desc", v)} textarea />
          </div>
        ))}
      </SectionCard>

      <SectionCard
        title="How It Works Section"
        onSave={() => handleSaveSection("howItWorks")}
        saving={savingSection === "howItWorks"}
        status={sectionStatus.howItWorks}
      >
        <Field label="Eyebrow" value={content.howItWorksEyebrow} onChange={(v) => handleChange("howItWorksEyebrow", v)} />
        <Field label="Title" value={content.howItWorksTitle} onChange={(v) => handleChange("howItWorksTitle", v)} />
        {content.howItWorks.map((step, i) => (
          <div key={i} className="mb-4 rounded-xl border border-[#E5E7EB] p-4">
            <p className="mb-2 text-xs font-bold text-[#F97316]">Step {i + 1}</p>
            <Field label="Step number label" value={step.n} onChange={(v) => handleArrayItemChange("howItWorks", i, "n", v)} />
            <Field label="Icon" value={step.icon} onChange={(v) => handleArrayItemChange("howItWorks", i, "icon", v)} />
            <Field label="Title" value={step.title} onChange={(v) => handleArrayItemChange("howItWorks", i, "title", v)} />
            <Field label="Description" value={step.desc} onChange={(v) => handleArrayItemChange("howItWorks", i, "desc", v)} textarea />
          </div>
        ))}
      </SectionCard>

      <SectionCard
        title="Featured Vendors Section (header only — vendors are live data)"
        onSave={() => handleSaveSection("vendors")}
        saving={savingSection === "vendors"}
        status={sectionStatus.vendors}
      >
        <Field label="Eyebrow" value={content.vendorsEyebrow} onChange={(v) => handleChange("vendorsEyebrow", v)} />
        <Field label="Title" value={content.vendorsTitle} onChange={(v) => handleChange("vendorsTitle", v)} />
      </SectionCard>

      <SectionCard
        title="Reviews Section"
        onSave={() => handleSaveSection("reviews")}
        saving={savingSection === "reviews"}
        status={sectionStatus.reviews}
      >
        <Field label="Eyebrow" value={content.reviewsEyebrow} onChange={(v) => handleChange("reviewsEyebrow", v)} />
        <Field label="Title" value={content.reviewsTitle} onChange={(v) => handleChange("reviewsTitle", v)} />
        {content.reviews.map((review, i) => (
          <div key={i} className="mb-4 rounded-xl border border-[#E5E7EB] p-4">
            <p className="mb-2 text-xs font-bold text-[#F97316]">Review {i + 1}</p>
            <Field label="Name" value={review.name} onChange={(v) => handleArrayItemChange("reviews", i, "name", v)} />
            <Field label="Role / location" value={review.role} onChange={(v) => handleArrayItemChange("reviews", i, "role", v)} />
            <Field label="Quote" value={review.quote} onChange={(v) => handleArrayItemChange("reviews", i, "quote", v)} textarea />
          </div>
        ))}
      </SectionCard>

      <SectionCard
        title="App Promo Section"
        onSave={() => handleSaveSection("app")}
        saving={savingSection === "app"}
        status={sectionStatus.app}
      >
        <Field label="Eyebrow" value={content.appEyebrow} onChange={(v) => handleChange("appEyebrow", v)} />
        <Field label="Title" value={content.appTitle} onChange={(v) => handleChange("appTitle", v)} />
        <Field label="Subtitle" value={content.appSubtitle} onChange={(v) => handleChange("appSubtitle", v)} textarea />
        <Field label="App Store button text" value={content.appStoreText} onChange={(v) => handleChange("appStoreText", v)} />
        <Field label="Google Play button text" value={content.googlePlayText} onChange={(v) => handleChange("googlePlayText", v)} />
      </SectionCard>
    </div>
  );
};

export default AdminHomeContent;