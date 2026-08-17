import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

const API_URL = process.env.REACT_APP_API_URL;
const CONTENT_API = `${API_URL}/api/admin/header-content`;

// logoImage is a full Cloudinary URL (https://res.cloudinary.com/...) once
// uploaded, so no base-URL prefixing is needed — just return it as-is.
const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  return imagePath;
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

const AdminHeaderContent = () => {
  const [logoText, setLogoText] = useState("");
  const [logoImage, setLogoImage] = useState(""); // existing saved Cloudinary URL (for preview)
  const [logoFile, setLogoFile] = useState(null); // newly picked file, not uploaded yet
  const [previewUrl, setPreviewUrl] = useState(null); // local blob preview for the newly picked file
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  // token is stored under the "token" key by authSlice.js (login reducer)
  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const res = await axios.get(CONTENT_API, { headers: getAuthHeaders() });
        if (res.data?.content) {
          setLogoText(res.data.content.logoText || "");
          setLogoImage(res.data.content.logoImage || "");
        }
      } catch (error) {
        console.log(error);
        Swal.fire({
          icon: "error",
          title: "Couldn't load logo",
          text: error.response?.data?.msg || "Failed to load current logo.",
          ...swalTheme,
        });
      } finally {
        setLoading(false);
      }
    };
    fetchContent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    const confirm = await Swal.fire({
      icon: "question",
      title: "Save header logo?",
      text: "This will update the live site header immediately.",
      showCancelButton: true,
      confirmButtonText: "Yes, save it",
      cancelButtonText: "Cancel",
      ...swalTheme,
    });
    if (!confirm.isConfirmed) return;

    setSaving(true);

    const formData = new FormData();
    formData.append("logoText", logoText);
    if (logoFile) formData.append("logoImage", logoFile);

    try {
      // Do NOT set Content-Type manually — axios sets the correct
      // multipart boundary automatically for FormData. Setting it
      // yourself breaks multer's parsing and req.body comes back undefined.
      const res = await axios.put(CONTENT_API, formData, {
        headers: getAuthHeaders(),
      });
      if (res.data?.content) {
        setLogoText(res.data.content.logoText || "");
        setLogoImage(res.data.content.logoImage || "");
        setLogoFile(null);
        setPreviewUrl(null);

        // Let any mounted sidebars (admin/vendor) update their logo instantly
        // without needing to re-fetch or remount.
        window.dispatchEvent(
          new CustomEvent("headerLogoUpdated", { detail: res.data.content })
        );
      }
      Swal.fire({
        icon: "success",
        title: "Saved",
        text: "Header logo updated successfully.",
        timer: 1800,
        showConfirmButton: false,
        ...swalTheme,
      });
    } catch (error) {
      console.log(error);
      Swal.fire({
        icon: "error",
        title: "Save failed",
        text: error.response?.data?.msg || "Failed to save logo.",
        ...swalTheme,
      });
    } finally {
      setSaving(false);
    }
  };

  const displayUrl = previewUrl || getImageUrl(logoImage);

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

      <button
        onClick={() => navigate("/admin/settings")}
        className="ad-body mb-6 rounded-xl border border-[#E5E7EB] px-5 py-2.5 text-sm font-semibold text-[#1F2937] hover:border-[#F97316] hover:text-[#F97316]"
      >
        ← Back to Settings
      </button>

      <div>
        <h1 className="ad-display text-2xl font-extrabold sm:text-3xl">Header Logo</h1>
        <p className="ad-body mt-1 text-sm text-[#6B7280]">
          Changes here reflect on the site header immediately.
        </p>
      </div>

      <div className="ad-card mx-auto mt-5 max-w-2xl border border-[#E5E7EB] bg-white p-5">
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-14 text-sm text-[#6B7280]">
            <i className="fa-solid fa-circle-notch ad-spin text-[#F97316]"></i>
            Loading current logo…
          </div>
        ) : (
          <>
            {/* live preview */}
            <div className="mb-6 flex items-center gap-2.5 rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] p-4">
              {displayUrl ? (
                <img src={displayUrl} alt="Logo" className="h-10 w-10 rounded-xl object-cover" />
              ) : (
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F97316] text-white">
                  <i className="fa-solid fa-bolt text-base"></i>
                </span>
              )}
              <span className="ad-display text-2xl font-extrabold text-[#1F2937]">
                {logoText || "QuickSeva"}
              </span>
            </div>

            <div className="mb-4">
              <label className="ad-body mb-1 block text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
                Logo text
              </label>
              <input
                type="text"
                value={logoText}
                onChange={(e) => setLogoText(e.target.value)}
                className="ad-input ad-body w-full rounded-lg border border-[#E5E7EB] px-3.5 py-2 text-sm text-[#1F2937] outline-none"
              />
            </div>

            <div className="mb-4">
              <label className="ad-body mb-1 block text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
                Logo image
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="ad-input ad-body w-full rounded-lg border border-[#E5E7EB] px-3.5 py-2 text-sm text-[#1F2937] outline-none file:mr-3 file:rounded-lg file:border-0 file:bg-[#F97316]/10 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-[#F97316]"
              />
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleSave}
                disabled={saving}
                className="ad-btn ad-body rounded-xl bg-[#F97316] px-5 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
              >
                {saving ? "Saving…" : "Save Logo"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminHeaderContent;