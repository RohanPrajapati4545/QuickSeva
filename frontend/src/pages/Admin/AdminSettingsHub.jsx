import React from "react";
import { useNavigate } from "react-router-dom";

// Add a new entry here whenever a new section editor is built — the hub
// picks it up automatically, no other wiring needed.
const SETTINGS_SECTIONS = [
  {
    to: "/admin/settings/home",
    label: "Home Page",
    desc: "Hero, why-us, how-it-works, featured vendors, reviews & app promo.",
    icon: "fa-house",
    color: "#F97316",
  },
  {
    to: "/admin/settings/header",
    label: "Header",
    desc: "Top navigation bar — logo text, menu links & CTA button.",
    icon: "fa-bars",
    color: "#3B82F6",
  },
  {
    to: "/admin/settings/about",
    label: "About Page",
    desc: "Company story, mission, values & team section.",
    icon: "fa-circle-info",
    color: "#10B981",
  },
  {
    to: "/admin/settings/contact",
    label: "Contact Page",
    desc: "Contact details, address, form heading & support info.",
    icon: "fa-envelope",
    color: "#8B5CF6",
  },
];

const AdminSettingsHub = () => {
  const navigate = useNavigate();

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-8">
        <h1 className="vd-display text-2xl font-extrabold text-[#1F2937]">Website Settings</h1>
        <p className="vd-body mt-1 text-sm text-[#6B7280]">
          Pick a section below to edit the content shown on the live site.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {SETTINGS_SECTIONS.map((section) => (
          <button
            key={section.to}
            type="button"
            onClick={() => navigate(section.to)}
            className="group flex items-start gap-4 rounded-2xl border border-[#E5E7EB] bg-white p-5 text-left shadow-[0_10px_28px_-22px_rgba(31,41,55,0.25)] transition-all duration-200 hover:-translate-y-1 hover:border-transparent hover:shadow-[0_20px_40px_-20px_rgba(31,41,55,0.25)]"
          >
            <span
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-lg text-white transition-transform duration-200 group-hover:scale-105"
              style={{ backgroundColor: section.color }}
            >
              <i className={`fa-solid ${section.icon}`}></i>
            </span>

            <span className="min-w-0 flex-1">
              <span className="vd-display flex items-center justify-between gap-2 text-base font-bold text-[#1F2937]">
                {section.label}
                <i className="fa-solid fa-arrow-right text-xs text-[#9CA3AF] transition-all duration-200 group-hover:translate-x-1 group-hover:text-[#1F2937]"></i>
              </span>
              <span className="vd-body mt-1 block text-sm leading-relaxed text-[#6B7280]">{section.desc}</span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default AdminSettingsHub;