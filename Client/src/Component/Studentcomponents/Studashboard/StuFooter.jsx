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
    window.open(`https://api.whatsapp.com/send?phone=${encodeURIComponent(phoneNumber)}`, "_blank");
  };

  const socials = [
    { src: insta, alt: "Instagram", href: "https://www.instagram.com/mentorlanguage/", hoverFilter: "sepia(1) saturate(4) hue-rotate(290deg)" },
    { src: facebook, alt: "Facebook", href: "https://www.facebook.com/mentorlanguage/", hoverFilter: "sepia(1) saturate(4) hue-rotate(180deg)" },
    { src: whatsapp, alt: "WhatsApp", onClick: handleWhatsAppChat, hoverFilter: "sepia(1) saturate(3) hue-rotate(85deg)" },
    { src: linkedin, alt: "LinkedIn", href: "https://www.linkedin.com/company/mentor-the-language-institute/?viewAsMember=true", hoverFilter: "sepia(1) saturate(4) hue-rotate(170deg)" },
    { src: youtube, alt: "YouTube", href: "https://youtube.com/@mentorlanguageinstitute8431?si=cztyFsLYOEKvWPO7", hoverFilter: "sepia(1) saturate(5) hue-rotate(320deg)" },
  ];

  return (
    <footer
      style={{
        margin: "2.5rem 1rem 1rem",
        borderRadius: "1.25rem",
        background: "#fff",
        border: "1px solid #fed7aa55",
        boxShadow: "0 -2px 20px -10px rgba(249,115,22,0.12)",
        overflow: "hidden",
      }}
    >
      {/* Gradient top accent bar */}
      <div style={{ height: "3px", background: "linear-gradient(90deg, #f97316, #fb923c, #fbbf24)" }} />

      <div style={{ padding: "1.5rem", maxWidth: "80rem", margin: "0 auto" }}>
        {/* Top row: logo + nav links */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "1rem",
            marginBottom: "1.25rem",
          }}
        >
          <img src={logo} style={{ height: "clamp(2.25rem, 5vw, 3rem)", width: "auto" }} alt="Mentor Institute logo" />

          <ul style={{ display: "flex", flexWrap: "wrap", gap: "1.5rem", listStyle: "none", margin: 0, padding: 0 }}>
            {[
              { to: "/main-dashboard", label: "Home" },
              { href: "#enrolledcourse", label: "Enrolled Courses" },
              { href: "#courses", label: "Browse Courses" },
            ].map((link) => (
              <li key={link.label}>
                {link.to ? (
                  <Link
                    to={link.to}
                    style={{ fontSize: "0.85rem", fontWeight: 600, color: "#64748b", textDecoration: "none", transition: "color 0.15s" }}
                    onMouseEnter={(e) => e.currentTarget.style.color = "#f97316"}
                    onMouseLeave={(e) => e.currentTarget.style.color = "#64748b"}
                  >
                    {link.label}
                  </Link>
                ) : (
                  <a
                    href={link.href}
                    style={{ fontSize: "0.85rem", fontWeight: 600, color: "#64748b", textDecoration: "none", transition: "color 0.15s" }}
                    onMouseEnter={(e) => e.currentTarget.style.color = "#f97316"}
                    onMouseLeave={(e) => e.currentTarget.style.color = "#64748b"}
                  >
                    {link.label}
                  </a>
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* Divider */}
        <hr style={{ border: "none", borderTop: "1px solid #f1f5f9", margin: "0 0 1.25rem" }} />

        {/* Bottom row: copyright + socials */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "1rem",
          }}
        >
          <div style={{ fontSize: "0.75rem", color: "#94a3b8", lineHeight: 1.6 }}>
            <p style={{ margin: 0 }}>
              Designed & Developed by{" "}
              <a
                href="https://www.doclabz.com/"
                target="_blank"
                rel="noreferrer"
                style={{ color: "#f97316", fontWeight: 700, textDecoration: "none" }}
              >
                DOC-LABZ
              </a>
            </p>
            <p style={{ margin: 0 }}>
              © 2024 <span style={{ fontWeight: 600, color: "#64748b" }}>Mentor Institute</span>. All rights reserved.
            </p>
          </div>

          {/* Social icons */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.875rem" }}>
            {socials.map((s) => {
              const inner = (
                <img
                  src={s.src}
                  alt={s.alt}
                  style={{ width: "28px", height: "28px", objectFit: "contain", transition: "filter 0.2s, transform 0.2s" }}
                  onMouseEnter={(e) => { e.currentTarget.style.filter = s.hoverFilter; e.currentTarget.style.transform = "translateY(-2px) scale(1.1)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.filter = "none"; e.currentTarget.style.transform = "none"; }}
                />
              );
              return s.onClick ? (
                <button key={s.alt} onClick={s.onClick} style={{ background: "none", border: "none", padding: 0, cursor: "pointer", display: "flex" }}>
                  {inner}
                </button>
              ) : (
                <a key={s.alt} href={s.href} target="_blank" rel="noreferrer" style={{ display: "flex" }}>
                  {inner}
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default StuFooter;
