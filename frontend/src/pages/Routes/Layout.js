import React from "react";
import Header from "./../../Components/Header";
import Footer from "./../../Components/Footer";

const Layout = ({ children }) => {
  return (
    // bg-[#0F0B14] + text-[#F8F4EC] yahin par set kar diya hai, isliye
    // kisi bhi individual page ke andar alag se background dena nahi padega —
    // Home, About, Contact, sab is Layout ke andar wrap honge to sab dark honge.
    <div className="flex min-h-screen flex-col bg-[#0F0B14] text-[#F8F4EC]">
      <Header />
      <div className="flex-1 w-full">{children}</div>
      <Footer />
    </div>
  );
};

export default Layout;