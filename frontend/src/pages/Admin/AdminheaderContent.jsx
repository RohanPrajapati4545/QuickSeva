import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_URL = process.env.REACT_APP_API_URL;
const CONTENT_API = `${API_URL}/api/admin/header-content`;

// logoImage is a full Cloudinary URL (https://res.cloudinary.com/...) once
// uploaded, so no base-URL prefixing is needed — just return it as-is.
const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  return imagePath;
};

const AdminHeaderContent = () => {
  const [logoText, setLogoText] = useState("");
  const [logoImage, setLogoImage] = useState(""); // existing saved Cloudinary URL (for preview)
  const [logoFile, setLogoFile] = useState(null); // newly picked file, not uploaded yet
  const [previewUrl, setPreviewUrl] = useState(null); // local blob preview for the newly picked file
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState(null);
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
        setStatus({ type: "error", msg: "Failed to load current logo." });
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
    setSaving(true);
    setStatus(null);

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
      }
      setStatus({ type: "success", msg: "Saved." });
    } catch (error) {
      console.log(error);
      setStatus({ type: "error", msg: error.response?.data?.msg || "Failed to save logo." });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-[#6B7280]">
        Loading current logo…
      </div>
    );
  }

  const displayUrl = previewUrl || getImageUrl(logoImage);

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <button
        onClick={() => navigate("/admin/settings")}
        className="mb-6 rounded-xl border border-[#E5E7EB] px-5 py-2.5 text-sm font-semibold text-[#1F2937] hover:bg-[#F8FAFC]"
      >
        ← Back to Settings
      </button>

      <h1 className="text-xl font-extrabold text-[#1F2937]">Header Logo</h1>
      <p className="mt-1 text-sm text-[#6B7280]">Changes here reflect on the site header immediately.</p>

      <div className="mt-6 rounded-2xl border border-[#E5E7EB] bg-white p-5">
        {/* live preview */}
        <div className="mb-6 flex items-center gap-2.5 rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] p-4">
          {displayUrl ? (
            <img src={displayUrl} alt="Logo" className="h-10 w-10 rounded-xl object-cover" />
          ) : (
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F97316] text-white">
              <i className="fa-solid fa-bolt text-base"></i>
            </span>
          )}
          <span className="text-2xl font-extrabold text-[#1F2937]">{logoText || "QuickSeva"}</span>
        </div>

        <div className="mb-4">
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[#6B7280]">Logo text</label>
          <input
            type="text"
            value={logoText}
            onChange={(e) => setLogoText(e.target.value)}
            className="w-full rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm text-[#1F2937] outline-none focus:border-[#3B82F6]"
          />
        </div>

        <div className="mb-4">
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[#6B7280]">Logo image</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="w-full rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm text-[#1F2937] outline-none file:mr-3 file:rounded-lg file:border-0 file:bg-[#3B82F6]/10 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-[#3B82F6]"
          />
        </div>

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
            onClick={handleSave}
            disabled={saving}
            className="rounded-xl bg-[#3B82F6] px-5 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save Logo"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminHeaderContent;