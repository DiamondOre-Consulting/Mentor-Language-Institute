import React from "react";
import logo from "..//..//..//assets/logo.png";
import { Link } from "react-router-dom";
import insta from "..//..//../assets/instagram.png";
import facebook from "..//..//../assets/facebook.png";
import whatsapp from "..//..//../assets/whatsapp.png";
import linkedin from "..//..//../assets/linkedin.png";
import youtube from "..//..//../assets/youtube.png";

const StuFooter = () => {
  const handleWhatsAppChat = () => {
    const phoneNumber = "8130265929";
    const url = `https://api.whatsapp.com/send?phone=${encodeURIComponent(phoneNumber)}`;
    window.open(url, "_blank");
  };

  return (
    <footer className="mx-4 mb-4 mt-10 rounded-2xl border border-orange-100 bg-white shadow-sm sm:mx-6 lg:mx-8">
      <div className="mx-auto w-full max-w-7xl p-5 sm:p-7">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <img src={logo} className="h-12 md:h-16" alt="Mentor Institute logo" />

          <ul className="flex flex-wrap items-center gap-4 text-sm font-medium text-slate-600">
            <li>
              <Link to="/main-dashboard" className="transition hover:text-orange-600 hover:underline">Home</Link>
            </li>
            <li>
              <a href="#enrolledcourse" className="transition hover:text-orange-600 hover:underline">Enrolled Courses</a>
            </li>
          </ul>
        </div>

        <hr className="my-5 border-orange-100" />

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="order-2 space-y-1 text-center text-xs text-slate-500 md:order-1 md:text-left sm:text-sm">
            <p>
              Designed & Developed by{" "}
              <a href="https://www.doclabz.com/" target="_blank" rel="noreferrer" className="text-orange-500 hover:underline">
                DOC-LABZ
              </a>
              .
            </p>
            <p>
              Copyright 2024 <span className="font-medium text-slate-700">Mentor Institute</span>. All rights reserved.
            </p>
          </div>

          <div className="order-1 flex items-center justify-center gap-4 md:order-2">
            <a href="https://www.instagram.com/mentorlanguage/" target="_blank" rel="noreferrer">
              <img src={insta} alt="Instagram" className="w-8 cursor-pointer" />
            </a>
            <a href="https://www.facebook.com/mentorlanguage/" target="_blank" rel="noreferrer">
              <img src={facebook} alt="Facebook" className="w-8" />
            </a>
            <button onClick={handleWhatsAppChat} className="inline-flex" aria-label="Open WhatsApp chat">
              <img src={whatsapp} alt="WhatsApp" className="w-8" />
            </button>
            <a href="https://www.linkedin.com/company/mentor-the-language-institute/?viewAsMember=true" target="_blank" rel="noreferrer">
              <img src={linkedin} alt="LinkedIn" className="w-8" />
            </a>
            <a href="https://youtube.com/@mentorlanguageinstitute8431?si=cztyFsLYOEKvWPO7" target="_blank" rel="noreferrer">
              <img src={youtube} alt="YouTube" className="w-8" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default StuFooter;
