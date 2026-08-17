import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

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

const AdminHomeContent = () => {
  const [content, setContent] = useState(EMPTY_CONTENT);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const [savingSection, setSavingSection] = useState(null);

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

  const handleSaveSection = async (sectionKey, sectionLabel) => {
    const confirm = await Swal.fire({
      icon: "question",
      title: `Save ${sectionLabel}?`,
      text: "This will update the live Home page immediately.",
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
        <h1 className="ad-display text-2xl font-extrabold sm:text-3xl">Home Page Content</h1>
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
            onSave={() => handleSaveSection("services", "Popular Services Section")}
            saving={savingSection === "services"}
          >
            <Field label="Eyebrow" value={content.servicesEyebrow} onChange={(v) => handleChange("servicesEyebrow", v)} />
            <Field label="Title" value={content.servicesTitle} onChange={(v) => handleChange("servicesTitle", v)} />
            <Field label="Subtitle" value={content.servicesSubtitle} onChange={(v) => handleChange("servicesSubtitle", v)} />
          </SectionCard>

          <SectionCard
            title="Why QuickSeva Section"
            onSave={() => handleSaveSection("whyUs", "Why QuickSeva Section")}
            saving={savingSection === "whyUs"}
          >
            <Field label="Eyebrow" value={content.whyUsEyebrow} onChange={(v) => handleChange("whyUsEyebrow", v)} />
            <Field label="Title" value={content.whyUsTitle} onChange={(v) => handleChange("whyUsTitle", v)} />
            {content.whyUs.map((item, i) => (
              <div key={i} className="mb-4 rounded-xl border border-[#E5E7EB] p-4">
                <p className="ad-body mb-2 text-xs font-bold text-[#F97316]">Box {i + 1}</p>
                <Field label="Icon (font-awesome name, no fa-solid prefix)" value={item.icon} onChange={(v) => handleArrayItemChange("whyUs", i, "icon", v)} />
                <Field label="Title" value={item.title} onChange={(v) => handleArrayItemChange("whyUs", i, "title", v)} />
                <Field label="Description" value={item.desc} onChange={(v) => handleArrayItemChange("whyUs", i, "desc", v)} textarea />
              </div>
            ))}
          </SectionCard>

          <SectionCard
            title="How It Works Section"
            onSave={() => handleSaveSection("howItWorks", "How It Works Section")}
            saving={savingSection === "howItWorks"}
          >
            <Field label="Eyebrow" value={content.howItWorksEyebrow} onChange={(v) => handleChange("howItWorksEyebrow", v)} />
            <Field label="Title" value={content.howItWorksTitle} onChange={(v) => handleChange("howItWorksTitle", v)} />
            {content.howItWorks.map((step, i) => (
              <div key={i} className="mb-4 rounded-xl border border-[#E5E7EB] p-4">
                <p className="ad-body mb-2 text-xs font-bold text-[#F97316]">Step {i + 1}</p>
                <Field label="Step number label" value={step.n} onChange={(v) => handleArrayItemChange("howItWorks", i, "n", v)} />
                <Field label="Icon" value={step.icon} onChange={(v) => handleArrayItemChange("howItWorks", i, "icon", v)} />
                <Field label="Title" value={step.title} onChange={(v) => handleArrayItemChange("howItWorks", i, "title", v)} />
                <Field label="Description" value={step.desc} onChange={(v) => handleArrayItemChange("howItWorks", i, "desc", v)} textarea />
              </div>
            ))}
          </SectionCard>

          <SectionCard
            title="Featured Vendors Section (header only — vendors are live data)"
            onSave={() => handleSaveSection("vendors", "Featured Vendors Section")}
            saving={savingSection === "vendors"}
          >
            <Field label="Eyebrow" value={content.vendorsEyebrow} onChange={(v) => handleChange("vendorsEyebrow", v)} />
            <Field label="Title" value={content.vendorsTitle} onChange={(v) => handleChange("vendorsTitle", v)} />
          </SectionCard>

          <SectionCard
            title="Reviews Section"
            onSave={() => handleSaveSection("reviews", "Reviews Section")}
            saving={savingSection === "reviews"}
          >
            <Field label="Eyebrow" value={content.reviewsEyebrow} onChange={(v) => handleChange("reviewsEyebrow", v)} />
            <Field label="Title" value={content.reviewsTitle} onChange={(v) => handleChange("reviewsTitle", v)} />
            {content.reviews.map((review, i) => (
              <div key={i} className="mb-4 rounded-xl border border-[#E5E7EB] p-4">
                <p className="ad-body mb-2 text-xs font-bold text-[#F97316]">Review {i + 1}</p>
                <Field label="Name" value={review.name} onChange={(v) => handleArrayItemChange("reviews", i, "name", v)} />
                <Field label="Role / location" value={review.role} onChange={(v) => handleArrayItemChange("reviews", i, "role", v)} />
                <Field label="Quote" value={review.quote} onChange={(v) => handleArrayItemChange("reviews", i, "quote", v)} textarea />
              </div>
            ))}
          </SectionCard>

          <SectionCard
            title="App Promo Section"
            onSave={() => handleSaveSection("app", "App Promo Section")}
            saving={savingSection === "app"}
          >
            <Field label="Eyebrow" value={content.appEyebrow} onChange={(v) => handleChange("appEyebrow", v)} />
            <Field label="Title" value={content.appTitle} onChange={(v) => handleChange("appTitle", v)} />
            <Field label="Subtitle" value={content.appSubtitle} onChange={(v) => handleChange("appSubtitle", v)} textarea />
            <Field label="App Store button text" value={content.appStoreText} onChange={(v) => handleChange("appStoreText", v)} />
            <Field label="Google Play button text" value={content.googlePlayText} onChange={(v) => handleChange("googlePlayText", v)} />
          </SectionCard>
        </>
      )}
    </div>
  );
};
export default AdminHomeContent;