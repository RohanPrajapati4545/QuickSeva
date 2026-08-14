import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";

const BASE_URL = process.env.REACT_APP_API_URL;
const DYNAMIC_API = `${BASE_URL}/api/dynamic`;

const PAGES = [
  { value: "home", label: "Home Page" },
  { value: "about", label: "About Page" },
  { value: "contact", label: "Contact Page" },
  { value: "header", label: "Header / Navigation" },
];

/**
 * DynamicContentEditor
 * ----------------------
 * Admin panel me ek route par mount karein (e.g. /admin/website-content).
 * - Page dropdown se select karo (Home / About / Contact / Header)
 * - Uska current content JSON textarea me load ho jaata hai
 * - Admin JSON edit karke "Save changes" dabaye -> PUT /api/dynamic/:page
 * - "Reset to default" -> DELETE /api/dynamic/:page (defaults par wapas)
 *
 * Yeh sabse simple/generic tareeka hai "sab kuch dynamic" allow karne ka —
 * kyunki content ka structure (arrays, nested objects) page-to-page alag hai,
 * ek JSON editor har naye field/section ke liye naya form banaye bina
 * poora control deta hai. Chaho to baad me isi API par har section ke liye
 * alag-alag chhote forms (title/desc inputs, "add card" button, etc.) bhi
 * bana sakte ho — backend already partial-update support karta hai.
 */
const DynamicContentEditor = () => {
  const { token } = useSelector((state) => state.auth || {});

  const [selectedPage, setSelectedPage] = useState("home");
  const [jsonText, setJsonText] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

  const loadContent = async (page) => {
    setLoading(true);
    setError("");
    setSuccessMsg("");
    try {
      const res = await axios.get(`${DYNAMIC_API}/${page}`);
      setJsonText(JSON.stringify(res.data.content, null, 2));
    } catch (err) {
      setError("Failed to load content.");
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContent(selectedPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPage]);

  const handleSave = async () => {
    setError("");
    setSuccessMsg("");
    let parsed;
    try {
      parsed = JSON.parse(jsonText);
    } catch (e) {
      setError("Invalid JSON — please check brackets/commas before saving.");
      return;
    }

    setSaving(true);
    try {
      const res = await axios.put(`${DYNAMIC_API}/${selectedPage}`, { content: parsed }, authHeaders);
      setJsonText(JSON.stringify(res.data.content, null, 2));
      setSuccessMsg("Saved! Changes are live on the site now.");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save content.");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!window.confirm("Reset this page's content back to the default? This can't be undone.")) return;
    setSaving(true);
    setError("");
    setSuccessMsg("");
    try {
      const res = await axios.delete(`${DYNAMIC_API}/${selectedPage}`, authHeaders);
      setJsonText(JSON.stringify(res.data.content, null, 2));
      setSuccessMsg("Reset to default.");
    } catch (err) {
      setError("Failed to reset content.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl p-6">
      <h1 className="text-2xl font-bold text-[#1F2937]">Website Content Manager</h1>
      <p className="mt-1 text-sm text-[#6B7280]">
        Home, About, Contact aur Header ka content yahan se edit karein. Changes save karte hi
        live website par turant dikhega.
      </p>

      <div className="mt-6 flex items-center gap-3">
        <label className="text-sm font-semibold text-[#374151]">Page:</label>
        <select
          value={selectedPage}
          onChange={(e) => setSelectedPage(e.target.value)}
          className="rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm"
        >
          {PAGES.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </select>

        <button
          onClick={() => loadContent(selectedPage)}
          className="rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm font-semibold text-[#374151] hover:bg-[#F8FAFC]"
        >
          Reload
        </button>
      </div>

      {error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600">
          {error}
        </div>
      )}
      {successMsg && (
        <div className="mt-4 rounded-lg border border-green-200 bg-green-50 px-4 py-2 text-sm text-green-700">
          {successMsg}
        </div>
      )}

      <div className="mt-4">
        {loading ? (
          <div className="py-10 text-center text-sm text-[#6B7280]">Loading...</div>
        ) : (
          <textarea
            value={jsonText}
            onChange={(e) => setJsonText(e.target.value)}
            rows={26}
            spellCheck={false}
            className="w-full rounded-xl border border-[#E5E7EB] bg-[#0B1220] p-4 font-mono text-xs leading-relaxed text-[#D1D5DB] outline-none focus:border-[#F97316]"
          />
        )}
      </div>

      <div className="mt-4 flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={saving || loading}
          className="rounded-xl bg-[#F97316] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#EA580C] disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save changes"}
        </button>
        <button
          onClick={handleReset}
          disabled={saving || loading}
          className="rounded-xl border border-[#E5E7EB] px-6 py-2.5 text-sm font-semibold text-[#374151] hover:bg-[#F8FAFC] disabled:opacity-60"
        >
          Reset to default
        </button>
      </div>
    </div>
  );
};

export default DynamicContentEditor;