import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import VendorSidebar from "../../Components/VendorSidebar";

const VendorLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="vd-shell min-h-screen bg-[#F8FAFC]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=Inter:wght@400;500;600;700&display=swap');
        .vd-display { font-family: 'Sora', system-ui, sans-serif; }
        .vd-body { font-family: 'Inter', system-ui, sans-serif; }

        .vd-nav-item { transition: background-color 0.2s ease, color 0.2s ease; }
        .vd-nav-active { background-color: #F97316; color: #FFFFFF; }
        .vd-nav-active:hover { color: #FFFFFF; }
      `}</style>

      {/* Desktop Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col bg-[#1F2937] lg:flex">
        <VendorSidebar />
      </aside>

      {/* Mobile Top Bar */}
      <div className="vd-body sticky top-0 z-30 flex items-center justify-between border-b border-[#E5E7EB] bg-white px-4 py-3.5 lg:hidden">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F97316] text-white">
            <i className="fa-solid fa-bolt text-xs"></i>
          </span>
          <span className="vd-display text-base font-extrabold text-[#1F2937]">
            Quick<span className="text-[#F97316]">Seva</span>
          </span>
        </div>

        {!sidebarOpen && (
          <button
            className="text-[#1F2937]"
            type="button"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
          >
            <i className="fa-solid fa-bars text-lg"></i>
          </button>
        )}
      </div>

      {/* Mobile Sidebar — pure Tailwind, no Bootstrap */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-[#1F2937]/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <div
            className="flex h-full w-64 flex-col bg-[#1F2937] transition-transform duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-end px-4 pt-4">
              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
                aria-label="Close menu"
              >
                <i className="fa-solid fa-xmark text-lg text-white/70"></i>
              </button>
            </div>

            <VendorSidebar onNavigate={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="lg:pl-64">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default VendorLayout;