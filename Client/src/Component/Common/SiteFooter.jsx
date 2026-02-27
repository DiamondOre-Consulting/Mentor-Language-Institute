import React from "react";
import { useLocation } from "react-router-dom";
import logo from "../../assets/logo.png";
import insta from "../../assets/instagram.png";
import facebook from "../../assets/facebook.png";
import whatsapp from "../../assets/whatsapp.png";
import linkedin from "../../assets/linkedin.png";
import youtube from "../../assets/youtube.png";

const SiteFooter = () => {
  const location = useLocation();
  const hideOn = [
    "/admin-dashboard",
    "/teacher-dashboard",
  ];
  const shouldHide = hideOn.some((prefix) => location.pathname.startsWith(prefix));

  if (shouldHide) return null;

  const handleWhatsAppChat = () => {
    const phoneNumber = "8130265929";
    const url = `https://api.whatsapp.com/send?phone=${encodeURIComponent(phoneNumber)}`;
    window.open(url, "_blank");
  };

  return (
    <footer className="mt-12 border-t border-slate-200 bg-white/95">
      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-8 px-4 py-10 sm:px-6 md:grid-cols-3 lg:px-8">
        <div>
          <img src={logo} alt="Mentor Institute logo" className="h-12" />
          <p className="mt-3 text-sm text-slate-600">
            Mentor Institute helps students build language confidence with expert-led courses and structured learning.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-bold uppercase tracking-wide text-slate-700">Contact</h3>
          <div className="mt-3 space-y-1 text-sm text-slate-600">
            <p>+91 9999466159</p>
            <p className="break-words">mentor.languageclasses@gmail.com</p>
            <p> F-4/1, Golf Course Rd, Block F, DLF Phase 1, Sector 26A, Gurugram,
              Haryana-122002</p>
          </div>
          <div className="mt-4 flex items-center gap-3">
            <a href="https://www.instagram.com/mentorlanguage/" target="_blank" rel="noreferrer">
              <img src={insta} alt="Instagram" className="w-7" />
            </a>
            <a href="https://www.facebook.com/mentorlanguage/" target="_blank" rel="noreferrer">
              <img src={facebook} alt="Facebook" className="w-7" />
            </a>
            <button onClick={handleWhatsAppChat} aria-label="Open WhatsApp chat">
              <img src={whatsapp} alt="WhatsApp" className="w-7" />
            </button>
            <a
              href="https://www.linkedin.com/company/mentor-the-language-institute/?viewAsMember=true"
              target="_blank"
              rel="noreferrer"
            >
              <img src={linkedin} alt="LinkedIn" className="w-7" />
            </a>
            <a href="https://youtube.com/@mentorlanguageinstitute8431?si=cztyFsLYOEKvWPO7" target="_blank" rel="noreferrer">
              <img src={youtube} alt="YouTube" className="w-7" />
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-200 px-4 py-4 text-center text-xs text-slate-500 sm:px-6 lg:px-8">
        Copyright {new Date().getFullYear()} Mentor Institute. All rights reserved.
      </div>
    </footer>
  );
};

export default SiteFooter;
