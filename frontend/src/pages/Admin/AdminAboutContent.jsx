import React from "react";
import { useNavigate } from "react-router-dom";

// Placeholder until an AboutContent model/controller/route exists — build
// it the same way AdminHomeContent.jsx + HomeContentSchema.js were built,
// then swap this component out for the real editor.
const AdminAboutContent = () => {
  const navigate = useNavigate();

  return (
    <div className="mx-auto flex max-w-3xl flex-col items-center px-4 py-20 text-center">
      <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#10B981]/10 text-2xl text-[#10B981]">
        <i className="fa-solid fa-circle-info"></i>
      </span>
      <h1 className="vd-display text-xl font-extrabold text-[#1F2937]">About Page Editor — Coming Soon</h1>
      <p className="vd-body mt-2 max-w-md text-sm text-[#6B7280]">
        This section isn't wired up to the backend yet. Once it is, you'll be able to edit the company story, mission
        and team section from here.
      </p>
      <button
        onClick={() => navigate("/admin/settings")}
        className="vd-body mt-6 rounded-xl border border-[#E5E7EB] px-5 py-2.5 text-sm font-semibold text-[#1F2937] hover:bg-[#F8FAFC]"
      >
        ← Back to Settings
      </button>
    </div>
  );
};

export default AdminAboutContent;